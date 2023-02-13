import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/doc', {
        name: 'List Docs',
        auth: 'user',
        group: 'Docs',
        description: 'List Docs',
        query: 'req.query.ListDocs.json',
        res: 'res.ListDocs.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const list = await Doc.list(config.pool, req.query);

            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
