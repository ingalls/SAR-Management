import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/schedule', {
        name: 'List Schedules',
        auth: 'user',
        group: 'Schedules',
        description: 'List Schedules',
        query: 'req.query.ListSchedules.json',
        res: 'res.ListSchedules.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Oncall:View');

        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
