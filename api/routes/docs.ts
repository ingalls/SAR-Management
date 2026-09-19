import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { sql, eq, and, asc, desc, SQL } from 'drizzle-orm';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import busboy from 'busboy';
import API2PDF from 'api2pdf';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { Doc } from '../lib/schema.js';
import { StandardResponse, DocResponse } from '../lib/types.js';
import { PreviewExt, docKey, normalizePath, validateName, splitPath, like } from '../lib/doc.js';

// Formats that are safe to render in the browser, everything else is sent as a download
const InlineExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'];

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    /** Ensure that a folder exists before something is placed into it */
    async function ensureFolder(folder: string): Promise<void> {
        const dir = splitPath(folder);
        if (!dir) return;

        const found = await config.models.Doc.list({
            limit: 1,
            where: sql`path = ${dir.path} AND name = ${dir.name} AND type = 'dir'`
        });

        if (!found.total) throw new Err(400, null, `Folder ${folder} does not exist`);
    }

    async function sibling(folder: string, name: string) {
        const found = await config.models.Doc.list({
            limit: 1,
            where: sql`path = ${folder} AND name = ${name}`
        });

        return found.total ? found.items[0] : null;
    }

    /** The database is the source of truth so a failed S3 cleanup only orphans an unreferenced object */
    async function deleteObjects(doc: { id: string; name: string; artifacts: Array<{ ext: string }> }): Promise<void> {
        for (const Key of [docKey(doc), ...doc.artifacts.map((artifact) => docKey(doc, artifact.ext))]) {
            try {
                await spaces.delete({ Key });
            } catch (err) {
                console.error(`not ok - failed to delete ${Key}`, err);
            }
        }
    }

    await schema.get('/doc', {
        name: 'List Docs',
        group: 'Docs',
        description: 'List the contents of a folder, or search for documents beneath it',
        query: Type.Object({
            path: Type.String({
                default: '/',
                description: 'Folder to list'
            }),
            recursive: Type.Boolean({
                default: false,
                description: 'Include the contents of all folders beneath the path'
            }),
            type: Type.Optional(Type.String({ enum: ['dir', 'file'] })),
            filter: Type.String({ default: '' }),
            limit: Type.Integer({ default: 100, minimum: 1, maximum: 1000 }),
            page: Type.Integer({ default: 0, minimum: 0 }),
            order: Type.Enum(GenericListOrder, { default: GenericListOrder.ASC }),
            sort: Type.String({ default: 'name', enum: Object.keys(Doc) })
        }),
        res: Type.Object({
            total: Type.Integer(),
            folder: Type.Union([Type.Null(), DocResponse], {
                description: 'The folder being listed, null for the root folder'
            }),
            items: Type.Array(DocResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.VIEW);

            const folder = normalizePath(req.query.path);

            const dir = splitPath(folder);
            const current = dir ? await sibling(dir.path, dir.name) : null;
            if (dir && (!current || current.type !== 'dir')) throw new Err(404, null, `Folder ${folder} does not exist`);

            const where: Array<SQL<unknown>> = [
                req.query.recursive
                    ? sql`Starts_With(${Doc.path}, ${folder})`
                    : eq(Doc.path, folder)
            ];

            if (req.query.filter) where.push(sql`${Doc.name} ILIKE ${like(req.query.filter)}`);
            if (req.query.type) where.push(eq(Doc.type, req.query.type));

            const order = req.query.order === GenericListOrder.DESC ? desc : asc;
            const sort = Doc[req.query.sort as keyof typeof Doc.$inferSelect];

            const pgres = await config.pool
                .select({
                    count: sql<string>`count(*) OVER()`.as('count'),
                    doc: Doc
                })
                .from(Doc)
                .where(and(...where))
                // Folders are always listed before files
                .orderBy(asc(Doc.type), order(sort), asc(Doc.path), asc(Doc.name))
                .limit(req.query.limit)
                .offset(req.query.page * req.query.limit);

            res.json({
                total: pgres.length ? parseInt(pgres[0].count) : 0,
                folder: current,
                items: pgres.map((row) => row.doc)
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/doc', {
        name: 'Create Doc',
        group: 'Docs',
        description: 'Upload a new doc, replacing the contents of an existing doc of the same name',
        query: Type.Object({
            path: Type.String({ default: '/' })
        }),
        res: DocResponse
    }, async (req, res) => {
        let bb: ReturnType<typeof busboy>;
        let folder: string;
        let uid: number;

        try {
            const user = await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.ADMIN);
            uid = user.id;

            folder = normalizePath(req.query.path);
            await ensureFolder(folder);

            if (req.headers['content-type']) {
                req.headers['content-type'] = req.headers['content-type'].split(',')[0];
            } else {
                throw new Err(400, null, 'Missing Content-Type Header');
            }

            bb = busboy({
                headers: req.headers,
                limits: {
                    files: 1
                }
            });
        } catch (err) {
            Err.respond(err, res);
            return;
        }

        const uploads: Array<Promise<typeof Doc.$inferSelect>> = [];
        bb.on('file', (fieldname, file, blob) => {
            uploads.push((async () => {
                let name: string;
                let existing: typeof Doc.$inferSelect | null;

                try {
                    name = validateName(path.basename(blob.filename || ''));
                    existing = await sibling(folder, name);
                    if (existing && existing.type !== 'file') throw new Err(400, null, `A folder named ${name} already exists`);
                } catch (err) {
                    file.resume();
                    throw err;
                }

                const id = existing ? existing.id : randomUUID();

                await spaces.upload({
                    Key: docKey({ id, name }),
                    Body: file
                });

                const head = await spaces.head({ Key: docKey({ id, name }) });

                if (existing) {
                    // Previews were generated from the previous contents
                    for (const artifact of existing.artifacts) {
                        await spaces.delete({ Key: docKey(existing, artifact.ext) })
                            .catch((err) => console.error(`not ok - failed to delete ${docKey(existing, artifact.ext)}`, err));
                    }

                    return await config.models.Doc.commit(id, {
                        uid,
                        updated: sql`Now()`,
                        size: head.ContentLength || 0,
                        artifacts: sql`'[]'::JSONB`
                    });
                } else {
                    return await config.models.Doc.generate({
                        id, uid, name,
                        type: 'file',
                        path: folder,
                        size: head.ContentLength || 0
                    });
                }
            })());
        }).on('finish', async () => {
            try {
                if (!uploads.length) throw new Err(400, null, 'No Upload Provided');

                res.json(await uploads[0]);
            } catch (err) {
                Err.respond(err, res);
            }
        });

        req.pipe(bb);
    });

    await schema.post('/doc/folder', {
        name: 'Create Folder',
        group: 'Docs',
        description: 'Create a new folder',
        body: Type.Object({
            path: Type.String({ default: '/' }),
            name: Type.String()
        }),
        res: DocResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.ADMIN);

            const folder = normalizePath(req.body.path);
            const name = validateName(req.body.name);

            await ensureFolder(folder);

            if (await sibling(folder, name)) throw new Err(400, null, `${name} already exists`);

            res.json(await config.models.Doc.generate({
                uid: user.id,
                type: 'dir',
                path: folder,
                name
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/doc/:docid', {
        name: 'Get Doc',
        group: 'Docs',
        description: 'Get a single doc or folder',
        params: Type.Object({
            docid: Type.String({ format: 'uuid' })
        }),
        res: DocResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.VIEW);

            res.json(await config.models.Doc.from(req.params.docid));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/doc/:docid', {
        name: 'Update Doc',
        group: 'Docs',
        description: 'Rename or move a doc or folder - the underlying S3 objects are never touched',
        params: Type.Object({
            docid: Type.String({ format: 'uuid' })
        }),
        body: Type.Object({
            path: Type.Optional(Type.String()),
            name: Type.Optional(Type.String())
        }),
        res: DocResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.ADMIN);

            const doc = await config.models.Doc.from(req.params.docid);

            const folder = req.body.path !== undefined ? normalizePath(req.body.path) : doc.path;
            const name = req.body.name !== undefined ? validateName(req.body.name) : doc.name;

            if (folder === doc.path && name === doc.name) {
                res.json(doc);
                return;
            }

            if (doc.type === 'file' && path.extname(name).toLowerCase() !== path.extname(doc.name).toLowerCase()) {
                throw new Err(400, null, `File extension must remain ${path.extname(doc.name) || 'empty'}`);
            }

            const prefix = `${doc.path}${doc.name}/`;
            if (doc.type === 'dir' && folder.startsWith(prefix)) {
                throw new Err(400, null, 'A folder cannot be moved inside of itself');
            }

            await ensureFolder(folder);

            const existing = await sibling(folder, name);
            if (existing && existing.id !== doc.id) throw new Err(400, null, `${name} already exists in ${folder}`);

            await config.pool.transaction(async (tx) => {
                await tx.update(Doc)
                    .set({ path: folder, name, updated: sql`Now()` })
                    .where(eq(Doc.id, doc.id));

                if (doc.type === 'dir') {
                    await tx.update(Doc)
                        .set({ path: sql`${`${folder}${name}/`} || Substr(${Doc.path}, ${prefix.length + 1})` })
                        .where(sql`Starts_With(${Doc.path}, ${prefix})`);
                }
            });

            res.json(await config.models.Doc.from(doc.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/doc/:docid', {
        name: 'Delete Doc',
        group: 'Docs',
        description: 'Delete a doc, or a folder and everything within it',
        params: Type.Object({
            docid: Type.String({ format: 'uuid' })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.ADMIN);

            const doc = await config.models.Doc.from(req.params.docid);

            const docs = [doc];

            if (doc.type === 'dir') {
                const prefix = `${doc.path}${doc.name}/`;

                docs.push(...await config.pool.transaction(async (tx) => {
                    const children = await tx.delete(Doc)
                        .where(sql`Starts_With(${Doc.path}, ${prefix})`)
                        .returning();

                    await tx.delete(Doc).where(eq(Doc.id, doc.id));

                    return children;
                }));
            } else {
                await config.models.Doc.delete(doc.id);
            }

            for (const child of docs) {
                if (child.type === 'file') await deleteObjects(child);
            }

            res.json({
                status: 200,
                message: doc.type === 'dir' ? 'Folder Deleted' : 'Document Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/doc/:docid/raw', {
        name: 'Raw Doc',
        group: 'Docs',
        description: 'Download a doc or one of its artifacts',
        params: Type.Object({
            docid: Type.String({ format: 'uuid' })
        }),
        query: Type.Object({
            token: Type.Optional(Type.String()),
            access_token: Type.Optional(Type.String({
                description: 'Single document token provided to the PDF conversion service'
            })),
            artifact: Type.Optional(Type.String({
                description: 'Extension of the artifact to return in place of the doc itself'
            })),
            download: Type.Boolean({ default: true })
        })
    }, async (req, res) => {
        try {
            if (req.query.access_token) {
                let decoded: JwtPayload;
                try {
                    decoded = jwt.verify(req.query.access_token, config.SigningSecret) as JwtPayload;
                } catch (err) {
                    throw new Err(401, err instanceof Error ? err : new Error(String(err)), 'Invalid Token');
                }

                if (decoded.scope !== 'doc-convert' || decoded.d !== req.params.docid) {
                    throw new Err(403, null, 'Token is not valid for this doc');
                }
            } else {
                await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.VIEW, { token: true });
            }

            const doc = await config.models.Doc.from(req.params.docid);
            if (doc.type !== 'file') throw new Err(400, null, 'Folders cannot be downloaded');

            let ext: string | undefined;
            let name = doc.name;
            if (req.query.artifact) {
                const artifact = doc.artifacts.find((a) => a.ext === req.query.artifact);
                if (!artifact) throw new Err(404, null, 'Artifact Not Found');
                ext = artifact.ext;
                name = `${path.parse(doc.name).name}${artifact.ext}`;
            }

            const file = await spaces.get({ Key: docKey(doc, ext) });

            res.contentType(name);
            res.set('X-Content-Type-Options', 'nosniff');
            if (file.ContentLength !== undefined) res.set('Content-Length', String(file.ContentLength));

            if (req.query.download || !InlineExt.includes(path.extname(name).toLowerCase())) {
                res.attachment(name);
            }

            const body = file.Body as Readable;
            body.pipe(res);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/doc/:docid/convert', {
        name: 'Convert Doc',
        group: 'Docs',
        description: 'Generate a PDF preview artifact for a doc',
        params: Type.Object({
            docid: Type.String({ format: 'uuid' })
        }),
        res: DocResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.ADMIN);

            if (!process.env.API2PDF) throw new Err(424, null, 'PDF Conversion not configured');
            const convert = new API2PDF(process.env.API2PDF);

            const doc = await config.models.Doc.from(req.params.docid);
            if (doc.type !== 'file') throw new Err(400, null, 'Folders cannot be converted');

            // The token is handed to a third party so it must only ever grant access to this doc
            const token = jwt.sign({
                scope: 'doc-convert',
                d: doc.id
            }, config.SigningSecret, { expiresIn: '30m' });

            const url = new URL(`/api/doc/${doc.id}/raw`, config.APIURL);
            url.searchParams.append('access_token', token);
            const converted = await convert.libreOfficeAnyToPdf(url.toString()) as API2PDF.Api2PdfResult;

            const file = await fetch(converted.FileUrl as string);
            if (!file.ok || !file.body) throw new Err(500, null, 'Failed to retrieve converted PDF');

            await spaces.upload({
                Key: docKey(doc, PreviewExt),
                Body: Readable.fromWeb(file.body as Parameters<typeof Readable.fromWeb>[0])
            });

            const head = await spaces.head({ Key: docKey(doc, PreviewExt) });

            const artifacts = doc.artifacts.filter((a) => a.ext !== PreviewExt);
            artifacts.push({ ext: PreviewExt, size: head.ContentLength || 0 });

            res.json(await config.models.Doc.commit(doc.id, {
                // The driver double encodes JSON parameters unless they are passed as TEXT
                artifacts: sql`${JSON.stringify(artifacts)}::TEXT::JSONB`
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
