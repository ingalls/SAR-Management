import Err from '@openaddresses/batch-error';
import Leadership from '../lib/types/leadership.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/leadership', {
        name: 'List Leadership',
        group: 'Leadership',
        auth: 'user',
        description: 'Get all team leaders',
        res: 'res.ListLeadership.json'
    }, async (req, res) => {
        try {
            Auth.is_auth(req);

            res.json(await Leadership.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
