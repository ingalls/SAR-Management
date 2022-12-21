import Err from '@openaddresses/batch-error';
import Leadership from '../lib/types/leadership.js';
import Auth from '../lib/auth.js';
import User from '../lib/types/user.js';
import Mission from '../lib/types/mission.js';
import Training from '../lib/types/training.js';
import moment from 'moment';

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
                },{
                    id: 'mission',
                    name: 'Missions'
                },{
                    id: 'training',
                    name: 'Training'
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
        ':calendar': 'string',
        query: 'req.query.ListEvents.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const events = [];

            if (req.params.calendar === 'birthday') {
                const queries = []

                if (moment(req.query.start).year() !== moment(req.query.end).year()) {
                    queries.push({ start: req.query.start, end: moment(moment(req.query.end).format('YYYY') + '-12-31') });
                    queries.push({ start: moment(moment(req.query.end).format('YYYY')), end: req.query.end });
                } else {
                    queries.push(req.query);
                }

                for (const query of queries) {
                    for (const user of (await User.list_bday(config.pool, {
                        start_bday: query.start,
                        end_bday: query.end
                    })).users) {
                        events.push({
                            title: `${user.fname} ${user.lname.slice(0, 1)}'s B-Day`,
                            start: moment(query.start).year() + '-' + moment(user.bday).format('MM-DD'),
                            end: moment(query.start).year() + '-' + moment(user.bday).format('MM-DD'),
                        });
                    }
                }
            } else if (req.params.calendar === 'mission') {
                for (const mission of (await Mission.list(config.pool, req.query)).missions) {
                    events.push({
                        title: mission.title,
                        start: mission.start_ts,
                        end: mission.end_ts
                    });
                }
            } else if (req.params.calendar === 'training') {
                for (const training of (await Training.list(config.pool, req.query)).training) {
                    events.push({
                        title: training.title,
                        start: training.start_ts,
                        end: training.end_ts
                    });
                }
            }

            res.json(events);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
