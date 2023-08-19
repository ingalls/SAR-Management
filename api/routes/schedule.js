import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schedule from '../lib/types/schedule.js';
import ScheduleAssigned from '../lib/types/schedule-assigned.js';

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
}
