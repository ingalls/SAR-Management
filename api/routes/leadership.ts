import Err from '@openaddresses/batch-error';
import Leadership from '../lib/types/leadership.js';
import LeadershipView from '../lib/views/leadership.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/leadership', {
        name: 'List Leadership',
        group: 'Leadership',
        auth: 'user',
        description: 'Get all team leaders',
        res: 'res.ListLeadership.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Leadership:View');

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
            await Auth.is_iam(config, req, 'Leadership:Admin');

            const leader = await Leadership.generate(config.pool, req.body);
            return res.json(await LeadershipView.from(config.pool, leader.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/leadership/:leaderid', {
        name: 'Patch Leadership',
        group: 'Leadership',
        auth: 'admin',
        description: 'Update a leader',
        params: Type.Object({
            leaderid: Type.Integer(),
        }),
        body: 'req.body.PatchLeadership.json',
        res: 'res.Leadership.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Leadership:Admin');

            const leader = await Leadership.from(config.pool, req.params.leaderid);
            leader.commit(req.body);
            return res.json(leader);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/leadership/:leaderid', {
        name: 'Delete Leadership',
        group: 'Leadership',
        auth: 'admin',
        description: 'delete a leader',
        params: Type.Object({
            leaderid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Leadership:Admin');

            await Leadership.delete(config.pool, req.params.leaderid);
            return res.json({
                status: 200,
                message: 'Leader Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}