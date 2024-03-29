import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import User from '../lib/types/user.js';
import Mission from '../lib/types/mission.js';
import Training from '../lib/views/training.js';
import jwt from 'jsonwebtoken';
import ical from 'ical-generator';
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
            await Auth.is_iam(req, 'Calendar:View');

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

    await schema.post('/calendar/:calendar/ical', {
        name: 'Create ICal Events',
        group: 'Calendar',
        auth: 'user',
        description: 'Query Events from a given calendar and return as ICAL',
        ':calendar': 'string'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);
            await Auth.is_iam(req, 'Calendar:View');

            const token = jwt.sign({
                u: req.auth.id,
                scopes: ['/calendar/training/ical']
            }, config.SigningSecret);

            res.json({ token });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/calendar/:calendar/ical', {
        name: 'ICal Events',
        group: 'Calendar',
        auth: 'user',
        description: 'Query Events from a given calendar and return as ICAL',
        ':calendar': 'string',
        query: 'req.query.ListEvents.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);
            await Auth.is_iam(req, 'Calendar:View');

            if (req.token) await Auth.is_scope(req, req.token.scopes);

            const calendar = ical({ name: 'MesaSAR Training Calendar' });
            if (req.params.calendar === 'training') {
                (await Training.stream(config.pool, req.query)).on('data', (training) => {
                    calendar.createEvent({
                        start: moment(training.start_ts),
                        end: moment(training.end_ts),
                        timezone: config.TimeZone,
                        description: training.body,
                        summary: training.title,
                        location: training.location,
                        url: String(new URL(`/training/${training.id}`, config.URL))
                    });
                }).on('end', () => {
                    res.setHeader('Content-Type', 'text/calendar');
                    res.send(calendar.toString());
                });
            } else {
                throw new Err(400, null, 'ICal export disabled');
            }
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
            await Auth.is_iam(req, 'Calendar:View');

            const events = [];

            if (req.params.calendar === 'birthday') {
                const queries = [];

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
                            path: `/user/${user.id}`,
                            end: moment(query.start).year() + '-' + moment(user.bday).format('MM-DD')
                        });
                    }
                }
            } else if (req.params.calendar === 'mission') {
                for (const mission of (await Mission.list(config.pool, req.query)).missions) {
                    events.push({
                        title: mission.title,
                        start: mission.start_ts,
                        end: mission.end_ts,
                        path: `/mission/${mission.id}`,
                        color: '#ea4335'
                    });
                }
            } else if (req.params.calendar === 'training') {
                for (const training of (await Training.list(config.pool, req.query)).training) {
                    events.push({
                        title: training.title,
                        start: training.start_ts,
                        end: training.end_ts,
                        path: `/training/${training.id}`,
                        color: '#fbbc04'
                    });
                }
            }

            res.json(events);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
