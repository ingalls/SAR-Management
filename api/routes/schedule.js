import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schedule from '../lib/types/schedule.js';
import ScheduleAssigned from '../lib/types/schedule-assigned.js';
import ScheduleEvent from '../lib/types/schedule-event.js';
import moment from 'moment';

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
        ':scheduleid': 'integer',
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

    await schema.get('/schedule/:scheduleid/events', {
        name: 'List Events',
        group: 'Schedules',
        auth: 'user',
        description: 'Query Events from a given schedule',
        ':scheduleid': 'integer',
        query: 'req.query.ListEvents.json'
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
                        title: 'DEMO',
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
        ':scheduleid': 'integer',
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
        ':scheduleid': 'integer',
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
