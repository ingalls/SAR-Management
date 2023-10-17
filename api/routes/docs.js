import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import busboy from 'busboy';
import API2PDF from 'api2pdf';
import jwt from 'jsonwebtoken';

function prefix(req) {
    if (!req.query.prefix) req.query.prefix = '';

    if (req.query.prefix && !req.query.prefix.endsWith('/')) {
        req.query.prefix = req.query.prefix + '/';
    }
}

export default async function router(schema, config) {
    const spaces = new Spaces();
    const convert = new API2PDF(process.env.API2PDF);

    await schema.get('/doc', {
        name: 'List Docs',
        auth: 'user',
        group: 'Docs',
        description: 'List Docs',
        query: 'req.query.ListDocs.json',
        res: 'res.ListDocs.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:View');

            prefix(req);

            req.query.prefix = 'documents/' + req.query.prefix;

            const s3list = await spaces.list({
                Prefix: req.query.prefix,
                Delimiter: '/'
            });

            const docs = new Set();

            const documents = [];

            documents.push(...(s3list.Contents || []).filter((obj) => {
                return obj.Key !== req.query.prefix;
            }).map((obj) => {
                const key = obj.Key.replace(req.query.prefix, '');
                docs.add(key);

                return {
                    type: 'file',
                    key: key,
                    last_modified: obj.LastModified,
                    size: obj.Size
                };
            }));

            documents.push(...(s3list.CommonPrefixes || [])
                .filter((dir) => {
                    const prefix = dir.Prefix
                        .replace(/\/$/, '')
                        .replace(req.query.prefix, '');

                    return !docs.has(prefix);
                }).map((dir) => {
                    return {
                        type: 'dir',
                        key: dir.Prefix.replace(req.query.prefix, ''),
                        last_modified: '',
                        size: 0
                    };
                }));

            return res.json({
                total: documents.length,
                documents
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/doc/convert', {
        name: 'Convert Doc',
        auth: 'user',
        group: 'Docs',
        description: 'Convert doc to a preview format',
        query: 'req.query.ConvertDoc.json'
    }, async (req, res) => {
        try {
            prefix(req);

            if (req.query.access_token) {
                const decoded = jwt.verify(req.query.access_token, config.SigningSecret);

                console.error(`documents/${decoded.p ? decoded.p + '/' : ''}${decoded.f}`)
                const file = await spaces.get({
                    Key: `documents/${decoded.p ? decoded.p + '/' : ''}${decoded.f}`
                });

                return file.Body.pipe(res);
            } else {
                await Auth.is_auth(req, true);
                await Auth.is_iam(req, 'Doc:Manage');

                const token = jwt.sign({
                    u: req.auth.id,
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

                return res.json({
                    status: 200,
                    message: 'Conversion Complete'
                });
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/doc/download', {
        name: 'Download Doc',
        auth: 'user',
        group: 'Docs',
        description: 'Download Doc',
        query: 'req.query.DownloadDoc.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);
            await Auth.is_iam(req, 'Doc:View');

            prefix(req);

            const file = await spaces.get({
                Key: `documents/${req.query.prefix}${req.query.file}`
            });

            if (!req.query.download) {
                return file.Body.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Disposition': `attachment; filename="${req.query.file}"`
                });
                return file.Body.pipe(res);
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/doc/folder', {
        name: 'Create Folder',
        auth: 'user',
        group: 'Docs',
        description: 'Create a new folder',
        query: 'req.query.CreateDoc.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Doc:Manage');

            prefix(req);

            await spaces.upload({
                Key: `documents/${req.query.prefix}`,
                Body: ''
            });

            return res.json({
                status: 200,
                message: 'Document Uploaded'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/doc', {
        name: 'Create Doc',
        auth: 'user',
        group: 'Docs',
        description: 'Create a new doc',
        query: 'req.query.CreateDoc.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        await Auth.is_iam(req, 'Doc:Manage');

        prefix(req);

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
            return Err.respond(err, res);
        }

        const uploads = [];
        bb.on('file', async (fieldname, file, blob) => {
            uploads.push(spaces.upload({
                Key: `documents/${req.query.prefix}${blob.filename}`,
                Body: file
            }));
        }).on('finish', async () => {
            try {
                if (!uploads.length) throw new Err(400, null, 'No Upload Provided');

                await uploads[0];

                return res.json({
                    status: 200,
                    message: 'Document Uploaded'
                });
            } catch (err) {
                Err.respond(err, res);
            }
        });

        return req.pipe(bb);
    });

    await schema.delete('/doc', {
        name: 'Delete Doc',
        auth: 'user',
        group: 'Docs',
        description: 'Delete Doc',
        query: 'req.query.DeleteDoc.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:Manage');

            req.query.file = 'documents/' + req.query.file;

            await spaces.delete({ Key: req.query.file });

            await spaces.deleteRecursive({ Prefix: req.query.file });

            return res.json({
                status: 200,
                message: 'Document Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
