import Err from '@openaddresses/batch-error';
import { Type, Static } from '@sinclair/typebox';
import { Readable } from 'node:stream';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import busboy from 'busboy';
import API2PDF from 'api2pdf';
import jwt from 'jsonwebtoken';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, DocResponse } from '../lib/types.js';

function prefix(prefix?: string): string {
    if (!prefix) return '';

    if (prefix && !prefix.endsWith('/')) {
        return prefix + '/';
    }

    return prefix;
}

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();
    const convert = new API2PDF(process.env.API2PDF);

    await schema.get('/doc', {
        name: 'List Docs',
        group: 'Docs',
        description: 'List Docs',
        query: Type.Object({
            prefix: Type.String({ default: '' }),
            filter: Type.String({ default: '' })
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(DocResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.VIEW);

            req.query.prefix = prefix(req.query.prefix);

            req.query.prefix = 'documents/' + req.query.prefix;

            const s3list = await spaces.list({
                Prefix: req.query.prefix || '',
                Delimiter: '/'
            });

            const docs: Set<string> = new Set();

            let documents: Array<Static<typeof DocResponse>> = [];

            documents.push(...(s3list.Contents || []).filter((obj) => {
                return obj.Key !== req.query.prefix;
            }).map((obj) => {
                const key = (obj.Key || '').replace(req.query.prefix, '');
                docs.add(key);

                return {
                    type: 'file',
                    key: key,
                    last_modified: obj.LastModified ? obj.LastModified.toISOString() : '',
                    size: obj.Size || 0
                };
            }));

            documents.push(...(s3list.CommonPrefixes || [])
                .filter((dir) => {
                    const prefix = (dir.Prefix || '')
                        .replace(/\/$/, '')
                        .replace(req.query.prefix, '');

                    return !docs.has(prefix);
                }).map((dir) => {
                    return {
                        type: 'dir',
                        key: (dir.Prefix || '').replace(req.query.prefix, ''),
                        last_modified: '',
                        size: 0
                    };
                }));

            documents = documents.filter((doc) => {
                return doc.key.toLowerCase().includes(req.query.filter.toLowerCase())
            })

            res.json({
                total: documents.length,
                items: documents
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/doc/convert', {
        name: 'Convert Doc',
        group: 'Docs',
        description: 'Convert doc to a preview format',
        query: Type.Object({
            token: Type.Optional(Type.String()),
            access_token: Type.Optional(Type.String()),
            prefix: Type.Optional(Type.String()),
            file: Type.Optional(Type.String())
        })
    }, async (req, res) => {
        try {
            if (req.query.access_token) {
                const decoded = jwt.verify(req.query.access_token, config.SigningSecret);

                const file = await spaces.get({
                    Key: `documents/${decoded.p ? decoded.p : ''}${decoded.f}`
                });

                const body = file.Body as Readable;
                body.pipe(res);
            } else {
                const user = await Auth.is_auth(config, req, { token: true });
                await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.MANAGE, { token: true });

                req.query.prefix = prefix(req.query.prefix);

                const token = jwt.sign({
                    u: user.id,
                    p: req.query.prefix,
                    f: req.query.file
                }, config.SigningSecret, { expiresIn: '30m' });

                const url = new URL('/api/doc/convert', config.APIURL);
                url.searchParams.append('access_token', token);
                const doc = await convert.libreOfficeAnyToPdf(url);

                const file = await fetch(doc.FileUrl);

                spaces.upload({
                    Key: `documents/${req.query.prefix}${req.query.file}/preview.pdf`,
                    Body: file.body
                });

                res.json({
                    status: 200,
                    message: 'Conversion Complete'
                });
            }
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/doc/download', {
        name: 'Download Doc',
        group: 'Docs',
        description: 'Download Doc',
        query: Type.Object({
            token: Type.Optional(Type.String()),
            prefix: Type.String({ default: '' }),
            file: Type.String({ default: '' }),
            download: Type.Boolean({ default: true })
        })
    }, async (req, res) => {
        try {
            await Auth.is_auth(config, req, { token: true });
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.VIEW, { token: true });

            req.query.prefix = prefix(req.query.prefix);

            const file = await spaces.get({
                Key: `documents/${req.query.prefix}${req.query.file}`
            });

            if (!req.query.download) {
                const body = file.Body as Readable;
                body.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Disposition': `attachment; filename="${req.query.file}"`
                });
                const body = file.Body as Readable;
                body.pipe(res);
            }
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/doc/folder', {
        name: 'Create Folder',
        group: 'Docs',
        description: 'Create a new folder',
        query: Type.Object({
            prefix: Type.String({ default: '' })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.MANAGE);

            req.query.prefix = prefix(req.query.prefix);

            await spaces.upload({
                Key: `documents/${req.query.prefix}`,
                Body: ''
            });

            res.json({
                status: 200,
                message: 'Document Uploaded'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/doc', {
        name: 'Create Doc',
        group: 'Docs',
        description: 'Create a new doc',
        query: Type.Object({
            prefix: Type.String({ default: '' })
        }),
        res: StandardResponse
    }, async (req, res) => {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.MANAGE);

        req.query.prefix = prefix(req.query.prefix);

        if (req.headers['content-type']) {
            req.headers['content-type'] = req.headers['content-type'].split(',')[0];
        } else {
            throw new Err(400, null, 'Missing Content-Type Header');
        }

        let bb;
        try {
            bb = busboy({
                headers: req.headers,
                limits: {
                    files: 1
                }
            });
        } catch (err) {
            Err.respond(err, res);
        }

        const uploads: Array<Promise<unknown>> = [];
        bb.on('file', async (fieldname, file, blob) => {
            uploads.push(spaces.upload({
                Key: `documents/${req.query.prefix}${blob.filename}`,
                Body: file
            }));
        }).on('finish', async () => {
            try {
                if (!uploads.length) throw new Err(400, null, 'No Upload Provided');

                await uploads[0];

                res.json({
                    status: 200,
                    message: 'Document Uploaded'
                });
            } catch (err) {
                Err.respond(err, res);
            }
        });

        req.pipe(bb);
    });

    await schema.delete('/doc', {
        name: 'Delete Doc',
        group: 'Docs',
        description: 'Delete Doc',
        query: Type.Object({
            file: Type.String({ default: '' })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Doc, PermissionsLevel.MANAGE);

            req.query.file = 'documents/' + req.query.file;

            await spaces.delete({ Key: req.query.file });

            await spaces.deleteRecursive({ Prefix: req.query.file + '/' });

            res.json({
                status: 200,
                message: 'Document Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
