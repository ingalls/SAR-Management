import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';

export default async function router(schema) {
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

            return res.json({});
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
