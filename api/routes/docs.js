import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Spaces from '../lib/aws/spaces.js';

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

            req.query.prefix = 'documents/' + req.query.prefix

            const s3list = await spaces.list({
                Prefix: req.query.prefix,
                Delimiter: '/'
            });

            const documents = (s3list.CommonPrefixes || []).map((dir) => {
                return {
                    key: dir.Prefix.replace(req.query.prefix, ''),
                    last_modified: '',
                    size: 0
                }
            });
            documents.push(...(s3list.Contents || []).filter((obj) => {
                return obj.Key !== req.query.prefix;
            }).map((obj) => {
                return {
                    key: obj.Key.replace(req.query.prefix, ''),
                    last_modified: obj.LastModified,
                    size: obj.Size
                }
            }));

            return res.json({
                total: documents.length,
                documents
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
