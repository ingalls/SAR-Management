import Err from '@openaddresses/batch-error';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { Type, Static } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import moment from 'moment';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { Schedule, ScheduleAssigned } from '../lib/schema.js';
import {
    StandardResponse,
    ScheduleResponse,
    ScheduleEventResponse,
    ScheduleAssignedResponse
} from '../lib/types.js';

export const Event = Type.Object({
    title: Type.String(),
    imageurl: Type.String(),
    start: Type.String(),
    end: Type.String(),
    uid: Type.Integer(),
    id: Type.Integer()
});

export default async function router(schema: Schema, config: Config) {
    await schema.get('/schedule', {
        name: 'List Schedules',
        group: 'Schedules',
        description: 'List Schedules',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Schedule)})),
            disabled: Type.Optional(Type.Boolean({ default: false })),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ScheduleResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            res.json(await config.models.Schedule.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                    AND (${req.query.disabled} IS NULL OR disabled = ${req.query.disabled})
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/schedule', {
        name: 'Create Schedule',
        group: 'Schedules',
        description: 'Create a new schedule',
        body: Type.Object({
            name: Type.String(),
            body: Type.String(),
            handoff: Type.Optional(Type.String()),
            assigned: Type.Optional(Type.Array(ScheduleAssignedResponse))
        }),
        res: ScheduleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.ADMIN);

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const schedule = await config.models.Schedule.generate(req.body);

            if (assigned) {
                for (const a of assigned) {
                    await config.models.ScheduleAssigned.generate({
                        schedule_id: schedule.id,
                        role: 'Default',
                        uid: a.uid
                    });
                }
            }

            res.json(schedule);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/schedule/:scheduleid', {
        name: 'Update Schedule',
        group: 'Schedules',
        description: 'Update Schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            handoff: Type.Optional(Type.String()),
        }),
        res: ScheduleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.MANAGE);

            const schedule = await config.models.Schedule.commit(req.params.scheduleid, req.body);
            res.json(schedule);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/schedule/:scheduleid/events', {
        name: 'Create Event',
        group: 'Schedules',
        description: 'Create a new Schedule Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: Type.Object({
            start_ts: Type.String(),
            end_ts: Type.String(),
            uid: Type.Integer(),
        }),
        res: ScheduleEventResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            await config.models.Schedule.from(req.params.scheduleid);

            try {
                await config.models.ScheduleAssigned.from(sql`
                    schedule_id = ${req.params.scheduleid}
                    AND uid = ${req.body.uid}
                `);
            } catch (err) {
                throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'User is not part of On-Call Schedule')
            }

            const event = await config.models.ScheduleEvent.generate({
                ...req.body,
                schedule_id: req.params.scheduleid
            });

            res.json(await config.models.ScheduleEvent.augmented_from(event.id))
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/schedule/:scheduleid/events/:eventid', {
        name: 'Update Event',
        group: 'Schedules',
        description: 'Update a Scheduled Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
            eventid: Type.Integer()
        }),
        body: Type.Object({
            start_ts: Type.Optional(Type.String()),
            end_ts: Type.Optional(Type.String()),
            uid: Type.Optional(Type.Integer()),
        }),
        res: ScheduleEventResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            if (req.body.uid) {
                try {
                    await config.models.ScheduleAssigned.from(sql`
                        schedule_id = ${req.params.scheduleid}
                        AND uid = ${req.body.uid}
                    `);
                } catch (err) {
                    throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'User is not part of On-Call Schedule')
                }
            }

            const event = await config.models.ScheduleEvent.from(req.params.eventid);
            if (event.schedule_id !== schedule.id) throw new Err(400, null, 'Event is not part of specified schedule');

            await config.models.ScheduleEvent.commit(req.params.eventid, req.body);

            res.json(await config.models.ScheduleEvent.augmented_from(req.params.eventid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/schedule/:scheduleid/events/:eventid', {
        name: 'Delete Event',
        group: 'Schedules',
        description: 'Update a Scheduled Event',
        params: Type.Object({
            scheduleid: Type.Integer(),
            eventid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);

            const event = await config.models.ScheduleEvent.from(req.params.eventid);
            if (event.schedule_id !== schedule.id) throw new Err(400, null, 'Event is not part of specified schedule');

            await config.models.ScheduleEvent.delete(req.params.eventid);

            res.json({
                status: 200,
                message: 'Event Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/events', {
        name: 'List Events',
        group: 'Schedules',
        description: 'Query Events from a given schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: Type.Object({
            start: Type.String(),
            end: Type.String(),
        }),
        res: Type.Array(Event)
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const events: Array<Static<typeof Event>> = [];

            const queries: Array<{
                start: string
                end: string
            }> = [];

            if (moment(req.query.start).year() !== moment(req.query.end).year()) {
                queries.push({ start: req.query.start, end: String(moment(moment(req.query.end).format('YYYY')) + '-12-31') });
                queries.push({ start: moment(moment(req.query.end).format('YYYY')).format('YYYY-MM-DD'), end: req.query.end });
            } else {
                queries.push(req.query);
            }

            for (const query of queries) {
                for (const event of (await config.models.ScheduleEvent.augmented_list({
                    where: sql`
                        schedule_id = ${req.params.scheduleid}
                        AND start_ts >= ${query.start}
                        AND end_ts <= ${query.end}
                    `
                })).items) {
                    events.push({
                        id: event.id,
                        uid: event.uid,
                        title: `${event.fname} ${event.lname}`,
                        imageurl: '',
                        start: moment(event.start_ts).toISOString(),
                        end: moment(event.end_ts).toISOString()
                    });
                }
            }

            res.json(events);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid', {
        name: 'Get Schedule',
        group: 'Schedules',
        description: 'Get Schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        res: ScheduleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            res.json(await config.models.Schedule.from(req.params.scheduleid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/assigned', {
        name: 'Get Assigned',
        group: 'Schedules',
        description: 'Get Assigned',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'id', enum: Object.keys(ScheduleAssigned)})),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ScheduleAssignedResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            res.json(await config.models.ScheduleAssigned.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    schedule_id = ${req.params.scheduleid}
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
