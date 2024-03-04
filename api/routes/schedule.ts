import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schedule from '../lib/types/schedule.js';
import ScheduleAssigned from '../lib/types/schedule-assigned.js';
import ScheduleEvent from '../lib/types/schedule-event.js';
import moment from 'moment';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
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

            return res.json(await Schedule.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/schedule', {
        name: 'Create Schedule',
        group: 'Schedules',
        auth: 'user',
        description: 'Create a new schedule',
        body: 'req.body.CreateSchedule.json',
        res: 'schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Oncall:Admin');

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const schedule = await Schedule.generate(config.pool, req.body);

            if (assigned) {
                for (const a of assigned) {
                    await ScheduleAssigned.generate(config.pool, {
                        schedule_id: schedule.id,
                        role: a.role,
                        uid: a.uid
                    });
                }
            }

            return res.json(schedule);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/schedule/:scheduleid', {
        name: 'Update Schedule',
        auth: 'user',
        group: 'Schedules',
        description: 'Update Schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: 'req.body.PatchSchedule.json',
        res: 'schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Oncall:Manage');

            const schedule = await Schedule.from(config.pool, req.params.scheduleid);
            await schedule.commit(req.body);
            return res.json(schedule);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/schedule/:scheduleid/events', {
        name: 'Create Event',
        group: 'Schedules',
        auth: 'user',
        description: 'Create a new Schedule Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: 'req.body.CreateScheduleEvent.json',
        res: 'schedules_event.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Schedule:View');

            await Schedule.from(config.pool, req.params.scheduleid);
            await ScheduleAssigned.is_user(config.pool, req.params.scheduleid, req.body.uid);

            // TODO: Generic should handle this
            req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            req.body.end_ts = moment(req.body.end_ts).unix() * 1000;

            const event = await ScheduleEvent.generate(config.pool, {
                ...req.body,
                schedule_id: req.params.scheduleid
            });

            res.json(event);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/schedule/:scheduleid/events/:eventid', {
        name: 'Update Event',
        group: 'Schedules',
        auth: 'user',
        description: 'Update a Scheduled Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
            eventid: Type.Integer()
        }),
        body: 'req.body.UpdateScheduleEvent.json',
        res: 'schedules_event.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Schedule:View');

            const schedule = await Schedule.from(config.pool, req.params.scheduleid);
            if (req.body.uid) await ScheduleAssigned.is_user(config.pool, req.params.scheduleid, req.body.uid);

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;

            const event = await ScheduleEvent.from(config.pool, req.params.eventid);
            if (event.schedule_id !== schedule.id) throw new Err(400, null, 'Event is not part of specified schedule');

            await event.commit(req.body);

            res.json(event);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/schedule/:scheduleid/events/:eventid', {
        name: 'Delete Event',
        group: 'Schedules',
        auth: 'user',
        description: 'Update a Scheduled Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
            eventid: Type.Integer()
        }),
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Schedule:View');

            const schedule = await Schedule.from(config.pool, req.params.scheduleid);

            const event = await ScheduleEvent.from(config.pool, req.params.eventid);
            if (event.schedule_id !== schedule.id) throw new Err(400, null, 'Event is not part of specified schedule');

            await event.delete();

            res.json({
                status: 200,
                message: 'Event Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/events', {
        name: 'List Events',
        group: 'Schedules',
        auth: 'user',
        description: 'Query Events from a given schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: 'req.query.ListEvents.json',
        res: {
            type: 'array',
            items: {
                type: 'object',
                required: ['title', 'imageurl', 'start', 'end', 'uid', 'id'],
                properties: {
                    title: { type: 'string' },
                    imageurl: { type: 'string' },
                    start: { type: 'string' },
                    end: { type: 'string' },
                    uid: { type: 'integer' },
                    id: { type: 'integer' }
                }
            }
        }
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Schedule:View');

            const events = [];

            const queries = [];

            if (moment(req.query.start).year() !== moment(req.query.end).year()) {
                queries.push({ start: req.query.start, end: moment(moment(req.query.end).format('YYYY') + '-12-31') });
                queries.push({ start: moment(moment(req.query.end).format('YYYY')), end: req.query.end });
            } else {
                queries.push(req.query);
            }

            for (const query of queries) {
                for (const event of (await ScheduleEvent.list(config.pool, req.params.scheduleid, {
                    start_ts: query.start,
                    end_ts: query.end
                })).events) {
                    events.push({
                        id: event.id,
                        uid: event.uid,
                        title: `${event.fname} ${event.lname}`,
                        imageurl: '',
                        start: moment(event.start_ts),
                        end: moment(event.end_ts)
                    });
                }
            }

            res.json(events);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid', {
        name: 'Get Schedule',
        auth: 'user',
        group: 'Schedules',
        description: 'Get Schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        res: 'schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Oncall:View');

            return res.json(await Schedule.from(config.pool, req.params.scheduleid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/assigned', {
        name: 'Get Assigned',
        auth: 'user',
        group: 'Schedules',
        description: 'Get Assigned',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: 'req.query.ListScheduleAssigned.json',
        res: 'res.ListScheduleAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Oncall:View');

            return res.json(await ScheduleAssigned.list(config.pool, req.params.scheduleid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
