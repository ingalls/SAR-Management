import Err from '@openaddresses/batch-error';
import { GenericListOrder, Param } from '@openaddresses/batch-generic';
import { Type, Static } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import moment from 'moment';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { Schedule, ScheduleOverride, User } from '../lib/schema.js';
import {
    StandardResponse,
    ScheduleResponse,
    ScheduleEventResponse,
    ScheduleOverrideResponse,
    UserResponse
} from '../lib/types.js';

export const Event = Type.Object({
    title: Type.String(),
    imageurl: Type.String(),
    start: Type.String(),
    end: Type.String(),
    uid: Type.Integer(),
    id: Type.Integer()
});

export const OnCallEntry = Type.Object({
    schedule_id: Type.Integer(),
    schedule_name: Type.String(),
    uid: Type.Integer(),
    fname: Type.String(),
    lname: Type.String(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    is_override: Type.Boolean()
});

type ScheduleRecord = Static<typeof ScheduleResponse>;

async function assertScheduleMember(config: Config, schedule: { team_id: number }, uid: number): Promise<void> {
    try {
        await config.models.User.augmented_from(sql`
            users.id = ${uid}
            AND users.disabled = false
            AND teams_id @> ARRAY[${schedule.team_id}::INT]
        `);
    } catch (err) {
        throw new Err(400, err instanceof Error ? err : new Error(String(err)), 'User is not part of the schedule subteam');
    }
}

async function listScheduleMembers(config: Config, schedule: { team_id: number }) {
    return await config.models.User.augmented_list({
        limit: 1000,
        sort: 'id',
        where: sql`
            users.disabled = false
            AND teams_id @> ARRAY[${schedule.team_id}::INT]
        `
    });
}

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

            res.json(await config.models.Schedule.augmented_list({
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
            team_id: Type.Integer(),
            name: Type.String(),
            body: Type.String(),
            handoff: Type.Optional(Type.String()),
            rotation_type: Type.Optional(Type.String({ default: 'none', enum: ['none', 'daily', 'weekly', 'custom'] })),
            rotation_period: Type.Optional(Type.Integer({ default: 1 }))
        }),
        res: ScheduleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.ADMIN);

            await config.models.Team.from(req.body.team_id);

            const schedule = await config.models.Schedule.generate(req.body);

            res.json(await config.models.Schedule.augmented_from(schedule.id));
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
            team_id: Type.Optional(Type.Integer()),
            name: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            handoff: Type.Optional(Type.String()),
            rotation_type: Type.Optional(Type.String({ enum: ['none', 'daily', 'weekly', 'custom'] })),
            rotation_period: Type.Optional(Type.Integer()),
        }),
        res: ScheduleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.MANAGE);

            if (req.body.team_id) await config.models.Team.from(req.body.team_id);

            await config.models.Schedule.commit(req.params.scheduleid, req.body);
            res.json(await config.models.Schedule.augmented_from(req.params.scheduleid));
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

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            await assertScheduleMember(config, schedule, req.body.uid);

            const newStart = new Date(req.body.start_ts);
            const newEnd = new Date(req.body.end_ts);

            // Find all overlapping events for this schedule
            const overlappingEvents = await config.models.ScheduleEvent.list({
                where: sql`
                    schedule_id = ${req.params.scheduleid}
                    AND start_ts < ${req.body.end_ts}
                    AND end_ts > ${req.body.start_ts}
                `
            });

            // Handle each overlapping event
            for (const existing of overlappingEvents.items) {
                const existingStart = new Date(existing.start_ts);
                const existingEnd = new Date(existing.end_ts);

                // Case 1: New event completely covers existing event - delete it
                if (newStart <= existingStart && newEnd >= existingEnd) {
                    await config.models.ScheduleEvent.delete(existing.id);
                }
                // Case 2: New event is completely within existing event - split it
                else if (newStart > existingStart && newEnd < existingEnd) {
                    // Truncate existing event to end at new event's start
                    await config.models.ScheduleEvent.commit(existing.id, {
                        end_ts: req.body.start_ts
                    });
                    // Create a new event for the remaining part after the new event
                    await config.models.ScheduleEvent.generate({
                        schedule_id: req.params.scheduleid,
                        uid: existing.uid,
                        start_ts: req.body.end_ts,
                        end_ts: existing.end_ts
                    });
                }
                // Case 3: Overlap at the start of existing event - truncate its end
                else if (newStart > existingStart && newStart < existingEnd) {
                    await config.models.ScheduleEvent.commit(existing.id, {
                        end_ts: req.body.start_ts
                    });
                }
                // Case 4: Overlap at the end of existing event - truncate its start
                else if (newEnd > existingStart && newEnd < existingEnd) {
                    await config.models.ScheduleEvent.commit(existing.id, {
                        start_ts: req.body.end_ts
                    });
                }
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
            if (req.body.uid) await assertScheduleMember(config, schedule, req.body.uid);

            const event = await config.models.ScheduleEvent.from(req.params.eventid);
            if (event.schedule_id !== schedule.id) throw new Err(400, null, 'Event is not part of specified schedule');

            // Determine new start/end times (use existing if not provided)
            const newStart = new Date(req.body.start_ts || event.start_ts);
            const newEnd = new Date(req.body.end_ts || event.end_ts);

            // Find all overlapping events for this schedule, excluding the current event
            const overlappingEvents = await config.models.ScheduleEvent.list({
                where: sql`
                    schedule_id = ${req.params.scheduleid}
                    AND id != ${req.params.eventid}
                    AND start_ts < ${newEnd.toISOString()}
                    AND end_ts > ${newStart.toISOString()}
                `
            });

            // Handle each overlapping event
            for (const existing of overlappingEvents.items) {
                const existingStart = new Date(existing.start_ts);
                const existingEnd = new Date(existing.end_ts);

                // Case 1: Updated event completely covers existing event - delete it
                if (newStart <= existingStart && newEnd >= existingEnd) {
                    await config.models.ScheduleEvent.delete(existing.id);
                }
                // Case 2: Updated event is completely within existing event - split it
                else if (newStart > existingStart && newEnd < existingEnd) {
                    // Truncate existing event to end at updated event's start
                    await config.models.ScheduleEvent.commit(existing.id, {
                        end_ts: newStart.toISOString()
                    });
                    // Create a new event for the remaining part after the updated event
                    await config.models.ScheduleEvent.generate({
                        schedule_id: req.params.scheduleid,
                        uid: existing.uid,
                        start_ts: newEnd.toISOString(),
                        end_ts: existing.end_ts
                    });
                }
                // Case 3: Overlap at the start of existing event - truncate its end
                else if (newStart > existingStart && newStart < existingEnd) {
                    await config.models.ScheduleEvent.commit(existing.id, {
                        end_ts: newStart.toISOString()
                    });
                }
                // Case 4: Overlap at the end of existing event - truncate its start
                else if (newEnd > existingStart && newEnd < existingEnd) {
                    await config.models.ScheduleEvent.commit(existing.id, {
                        start_ts: newEnd.toISOString()
                    });
                }
            }

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

            res.json(await config.models.Schedule.augmented_from(req.params.scheduleid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/members', {
        name: 'Get Schedule Members',
        group: 'Schedules',
        description: 'Get users from the subteam assigned to a schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'id', enum: Object.keys(User)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(UserResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);

            res.json(await config.models.User.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    users.disabled = false
                    AND teams_id @> ARRAY[${schedule.team_id}::INT]
                    AND (${Param(req.query.filter)}::TEXT IS NULL OR fname||' '||lname ~* ${Param(req.query.filter)})
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/schedule/oncall', {
        name: 'Get Current On-Call',
        group: 'Schedules',
        description: 'Get all personnel currently on-call across all schedules',
        query: Type.Object({
            schedule_id: Type.Optional(Type.Integer()),
        }),
        res: Type.Array(OnCallEntry)
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const now = moment().toISOString();
            const entries: Array<Static<typeof OnCallEntry>> = [];

            let scheduleWhere = sql`disabled = false`;
            if (req.query.schedule_id) {
                scheduleWhere = sql`disabled = false AND id = ${req.query.schedule_id}`;
            }

            const schedules = await config.models.Schedule.list({
                limit: 100,
                where: scheduleWhere
            });

            for (const schedule of schedules.items) {
                // Get overrides active right now for this schedule
                const overrides = await config.models.ScheduleOverride.augmented_list({
                    limit: 100,
                    where: sql`
                        schedule_id = ${schedule.id}
                        AND start_ts <= ${now}
                        AND end_ts >= ${now}
                    `
                });

                const overriddenUids = new Set(
                    overrides.items
                        .filter(o => o.override_uid !== null)
                        .map(o => o.override_uid)
                );

                // Get events active right now
                const events = await config.models.ScheduleEvent.augmented_list({
                    limit: 100,
                    where: sql`
                        schedule_id = ${schedule.id}
                        AND start_ts <= ${now}
                        AND end_ts >= ${now}
                    `
                });

                // Add non-overridden events
                for (const event of events.items) {
                    if (!overriddenUids.has(event.uid)) {
                        entries.push({
                            schedule_id: schedule.id,
                            schedule_name: schedule.name,
                            uid: event.uid,
                            fname: event.fname,
                            lname: event.lname,
                            start_ts: event.start_ts,
                            end_ts: event.end_ts,
                            is_override: false
                        });
                    }
                }

                // Add override replacements
                for (const override of overrides.items) {
                    entries.push({
                        schedule_id: schedule.id,
                        schedule_name: schedule.name,
                        uid: override.uid,
                        fname: override.uid_fname,
                        lname: override.uid_lname,
                        start_ts: override.start_ts,
                        end_ts: override.end_ts,
                        is_override: true
                    });
                }
            }

            res.json(entries);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/oncall', {
        name: 'Get Schedule On-Call',
        group: 'Schedules',
        description: 'Get personnel currently on-call for a specific schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        res: Type.Array(OnCallEntry)
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            const now = moment().toISOString();
            const entries: Array<Static<typeof OnCallEntry>> = [];

            const overrides = await config.models.ScheduleOverride.augmented_list({
                limit: 100,
                where: sql`
                    schedule_id = ${schedule.id}
                    AND start_ts <= ${now}
                    AND end_ts >= ${now}
                `
            });

            const overriddenUids = new Set(
                overrides.items
                    .filter(o => o.override_uid !== null)
                    .map(o => o.override_uid)
            );

            const events = await config.models.ScheduleEvent.augmented_list({
                limit: 100,
                where: sql`
                    schedule_id = ${schedule.id}
                    AND start_ts <= ${now}
                    AND end_ts >= ${now}
                `
            });

            for (const event of events.items) {
                if (!overriddenUids.has(event.uid)) {
                    entries.push({
                        schedule_id: schedule.id,
                        schedule_name: schedule.name,
                        uid: event.uid,
                        fname: event.fname,
                        lname: event.lname,
                        start_ts: event.start_ts,
                        end_ts: event.end_ts,
                        is_override: false
                    });
                }
            }

            for (const override of overrides.items) {
                entries.push({
                    schedule_id: schedule.id,
                    schedule_name: schedule.name,
                    uid: override.uid,
                    fname: override.uid_fname,
                    lname: override.uid_lname,
                    start_ts: override.start_ts,
                    end_ts: override.end_ts,
                    is_override: true
                });
            }

            res.json(entries);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/schedule/:scheduleid/generate', {
        name: 'Generate Rotation',
        group: 'Schedules',
        description: 'Auto-generate rotation events for a schedule based on its rotation configuration',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: Type.Object({
            start_date: Type.String(),
            end_date: Type.String(),
        }),
        res: Type.Object({
            status: Type.Integer(),
            message: Type.String(),
            events_created: Type.Integer()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.ADMIN);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);

            if (schedule.rotation_type === 'none') {
                throw new Err(400, null, 'Schedule does not have a rotation type configured');
            }

            const assigned = await listScheduleMembers(config, schedule);

            if (assigned.items.length === 0) {
                throw new Err(400, null, 'Schedule subteam has no active members for rotation');
            }

            let periodDays: number;
            if (schedule.rotation_type === 'daily') {
                periodDays = schedule.rotation_period;
            } else if (schedule.rotation_type === 'weekly') {
                periodDays = schedule.rotation_period * 7;
            } else {
                periodDays = schedule.rotation_period;
            }

            const startDate = moment(req.body.start_date);
            const endDate = moment(req.body.end_date);

            if (!startDate.isValid() || !endDate.isValid()) {
                throw new Err(400, null, 'Invalid date format');
            }
            if (endDate.isBefore(startDate)) {
                throw new Err(400, null, 'End date must be after start date');
            }

            let eventsCreated = 0;
            let currentStart = startDate.clone();
            let memberIndex = 0;

            while (currentStart.isBefore(endDate)) {
                const shiftStart = moment(`${currentStart.format('YYYY-MM-DD')}T${schedule.handoff}`);
                const shiftEnd = moment(shiftStart).add(periodDays, 'days');

                if (shiftEnd.isAfter(endDate)) {
                    shiftEnd.set({
                        year: endDate.year(),
                        month: endDate.month(),
                        date: endDate.date(),
                        hour: moment(schedule.handoff, 'HH:mm').hour(),
                        minute: moment(schedule.handoff, 'HH:mm').minute()
                    });
                }

                const member = assigned.items[memberIndex % assigned.items.length];

                await config.models.ScheduleEvent.generate({
                    schedule_id: schedule.id,
                    start_ts: shiftStart.toISOString(),
                    end_ts: shiftEnd.toISOString(),
                    uid: member.id
                });

                eventsCreated++;
                memberIndex++;
                currentStart = currentStart.add(periodDays, 'days');
            }

            res.json({
                status: 200,
                message: `Generated ${eventsCreated} rotation events`,
                events_created: eventsCreated
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/schedule/:scheduleid/override', {
        name: 'List Overrides',
        group: 'Schedules',
        description: 'List overrides for a schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({ default: 'id', enum: Object.keys(ScheduleOverride) })),
            start: Type.Optional(Type.String()),
            end: Type.Optional(Type.String()),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ScheduleOverrideResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            let where = sql`schedule_id = ${req.params.scheduleid}`;
            if (req.query.start && req.query.end) {
                where = sql`
                    schedule_id = ${req.params.scheduleid}
                    AND start_ts >= ${req.query.start}
                    AND end_ts <= ${req.query.end}
                `;
            }

            res.json(await config.models.ScheduleOverride.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/schedule/:scheduleid/override', {
        name: 'Create Override',
        group: 'Schedules',
        description: 'Create an on-call override for a schedule',
        params: Type.Object({
            scheduleid: Type.Integer(),
        }),
        body: Type.Object({
            start_ts: Type.String(),
            end_ts: Type.String(),
            uid: Type.Integer(),
            override_uid: Type.Optional(Type.Integer()),
            reason: Type.Optional(Type.String()),
        }),
        res: ScheduleOverrideResponse
    }, async (req, res) => {
        try {
            const auth = await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            await assertScheduleMember(config, schedule, req.body.uid);
            if (req.body.override_uid) await assertScheduleMember(config, schedule, req.body.override_uid);

            const override = await config.models.ScheduleOverride.generate({
                schedule_id: req.params.scheduleid,
                start_ts: req.body.start_ts,
                end_ts: req.body.end_ts,
                uid: req.body.uid,
                override_uid: req.body.override_uid || null,
                reason: req.body.reason || '',
                created_by: auth.id,
            });

            res.json(await config.models.ScheduleOverride.augmented_from(override.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/schedule/:scheduleid/override/:overrideid', {
        name: 'Update Override',
        group: 'Schedules',
        description: 'Update an on-call override',
        params: Type.Object({
            scheduleid: Type.Integer(),
            overrideid: Type.Integer(),
        }),
        body: Type.Object({
            start_ts: Type.Optional(Type.String()),
            end_ts: Type.Optional(Type.String()),
            uid: Type.Optional(Type.Integer()),
            override_uid: Type.Optional(Type.Integer()),
            reason: Type.Optional(Type.String()),
        }),
        res: ScheduleOverrideResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            const override = await config.models.ScheduleOverride.from(req.params.overrideid);
            if (override.schedule_id !== schedule.id) throw new Err(400, null, 'Override is not part of specified schedule');

            if (req.body.uid) await assertScheduleMember(config, schedule, req.body.uid);
            if (req.body.override_uid) await assertScheduleMember(config, schedule, req.body.override_uid);

            await config.models.ScheduleOverride.commit(req.params.overrideid, req.body);

            res.json(await config.models.ScheduleOverride.augmented_from(req.params.overrideid));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/schedule/:scheduleid/override/:overrideid', {
        name: 'Delete Override',
        group: 'Schedules',
        description: 'Delete an on-call override',
        params: Type.Object({
            scheduleid: Type.Integer(),
            overrideid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.OnCall, PermissionsLevel.VIEW);

            const schedule = await config.models.Schedule.from(req.params.scheduleid);
            const override = await config.models.ScheduleOverride.from(req.params.overrideid);
            if (override.schedule_id !== schedule.id) throw new Err(400, null, 'Override is not part of specified schedule');

            await config.models.ScheduleOverride.delete(req.params.overrideid);

            res.json({
                status: 200,
                message: 'Override Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
