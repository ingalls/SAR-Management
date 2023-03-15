import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';
import busboy from 'busboy';

export default async function router(schema) {
    const spaces = new Spaces();

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

            req.query.prefix = 'documents/' + req.query.prefix;

            const s3list = await spaces.list({
                Prefix: req.query.prefix,
                Delimiter: '/'
            });

            const documents = (s3list.CommonPrefixes || []).map((dir) => {
                return {
                    type: 'dir',
                    key: dir.Prefix.replace(req.query.prefix, ''),
                    last_modified: '',
                    size: 0
                };
            });
            documents.push(...(s3list.Contents || []).filter((obj) => {
                return obj.Key !== req.query.prefix;
            }).map((obj) => {
                return {
                    type: 'file',
                    key: obj.Key.replace(req.query.prefix, ''),
                    last_modified: obj.LastModified,
                    size: obj.Size
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

    await schema.post('/doc', {
        name: 'Create Doc',
        auth: 'user',
        group: 'Docs',
        description: 'Create a new doc',
        query: 'req.query.CreateDoc.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        await Auth.is_iam(req, 'Doc:Manage');

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

            await spaces.delete({
                Key: req.query.file
            });

            return res.json({
                status: 200,
                message: 'Document Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
