import Err from '@openaddresses/batch-error';
import Leadership from '../lib/types/leadership.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/calendar', {
        name: 'List Calendar Layers',
        group: 'Calendar',
        auth: 'user',
        description: 'Get all possible calendar layers',
        res: 'res.ListCalendarLayers.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json({
                layers: [{
                    id: 'birthday',
                    name: 'Birthdays'
                }]
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/calendar/:calendar/events', {
        name: 'List Events',
        group: 'Calendar',
        auth: 'user',
        description: 'Query Events from a given calendar',
        ':calendar': 'string'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(true);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
