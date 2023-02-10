import Err from '@openaddresses/batch-error';
import Leadership from '../lib/types/leadership.js';
import LeadershipView from '../lib/views/leadership.js';
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
            await Auth.is_auth(req);

                
            const list = await LeadershipView.list(config.pool, req.query);

            return res.json({
                total: list.total,
                leadership: list.leaders_view
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/leadership', {
        name: 'Create Leadership',
        group: 'Leadership',
        auth: 'admin',
        description: 'Create a new leader',
        body: 'req.body.CreateLeadership.json',
        res: 'res.Leadership.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const leader = await Leadership.generate(config.pool, req.body);
            return res.json(await LeadershipView.from(config.pool, leader.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
