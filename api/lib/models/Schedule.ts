import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Schedule, ScheduleEvent, ScheduleOverride, User } from '../schema.js';
import { sql, eq, is, asc, desc, and, lte, gte, SQL } from 'drizzle-orm';

export const AugmentedSchedule = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    team_id: Type.Integer(),
    name: Type.String(),
    body: Type.String(),
    handoff: Type.String(),
    disabled: Type.Boolean(),
    rotation_type: Type.String(),
    rotation_period: Type.Integer(),
    oncall_uid: Type.Union([Type.Integer(), Type.Null()]),
    oncall_fname: Type.Union([Type.String(), Type.Null()]),
    oncall_lname: Type.Union([Type.String(), Type.Null()])
});

export default class ScheduleModel extends Modeler<typeof Schedule> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Schedule);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedSchedule>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const now = new Date().toISOString();

        // Subquery to get current oncall for each schedule
        const OncallSubquery = this.pool
            .select({
                schedule_id: ScheduleEvent.schedule_id,
                uid: ScheduleEvent.uid,
                fname: User.fname,
                lname: User.lname,
                priority: sql<number>`1`.as('priority')
            })
            .from(ScheduleEvent)
            .leftJoin(User, eq(User.id, ScheduleEvent.uid))
            .where(and(
                lte(ScheduleEvent.start_ts, now),
                gte(ScheduleEvent.end_ts, now)
            ))
            .as('oncall_events');

        const OverrideSubquery = this.pool
            .select({
                schedule_id: ScheduleOverride.schedule_id,
                uid: sql<number>`COALESCE(${ScheduleOverride.override_uid}, ${ScheduleOverride.uid})`.as('uid'),
                fname: sql<string>`COALESCE(u2.fname, u1.fname)`.as('fname'),
                lname: sql<string>`COALESCE(u2.lname, u1.lname)`.as('lname'),
                priority: sql<number>`2`.as('priority')
            })
            .from(ScheduleOverride)
            .leftJoin(sql`users u1`, eq(sql`u1.id`, ScheduleOverride.uid))
            .leftJoin(sql`users u2`, eq(sql`u2.id`, ScheduleOverride.override_uid))
            .where(and(
                lte(ScheduleOverride.start_ts, now),
                gte(ScheduleOverride.end_ts, now)
            ))
            .as('oncall_overrides');

        // Combine events and overrides, with overrides taking priority
        const CombinedOncall = this.pool
            .select({
                schedule_id: sql<number>`COALESCE(e.schedule_id, o.schedule_id)`.as('schedule_id'),
                uid: sql<number>`COALESCE(o.uid, e.uid)`.as('uid'),
                fname: sql<string>`COALESCE(o.fname, e.fname)`.as('fname'),
                lname: sql<string>`COALESCE(o.lname, e.lname)`.as('lname')
            })
            .from(OncallSubquery)
            .fullJoin(OverrideSubquery, eq(sql`${OncallSubquery}.schedule_id`, sql`${OverrideSubquery}.schedule_id`))
            .as('combined_oncall');

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: Schedule.id,
                created: Schedule.created,
                updated: Schedule.updated,
                team_id: Schedule.team_id,
                name: Schedule.name,
                body: Schedule.body,
                handoff: Schedule.handoff,
                disabled: Schedule.disabled,
                rotation_type: Schedule.rotation_type,
                rotation_period: Schedule.rotation_period,
                oncall_uid: CombinedOncall.uid,
                oncall_fname: CombinedOncall.fname,
                oncall_lname: CombinedOncall.lname
            })
            .from(Schedule)
            .leftJoin(CombinedOncall, eq(Schedule.id, CombinedOncall.schedule_id))
            .where(query.where)
            .orderBy(orderBy)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => {
                    return t as Static<typeof AugmentedSchedule>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedSchedule>> {
        const now = new Date().toISOString();

        const pgres = await this.pool
            .select({
                id: Schedule.id,
                created: Schedule.created,
                updated: Schedule.updated,
                team_id: Schedule.team_id,
                name: Schedule.name,
                body: Schedule.body,
                handoff: Schedule.handoff,
                disabled: Schedule.disabled,
                rotation_type: Schedule.rotation_type,
                rotation_period: Schedule.rotation_period,
                oncall_uid: sql<number | null>`(
                    SELECT COALESCE(
                        (SELECT COALESCE(so.override_uid, so.uid)
                         FROM schedules_override so
                         WHERE so.schedule_id = ${Schedule.id}
                           AND so.start_ts <= ${now}
                           AND so.end_ts >= ${now}
                         LIMIT 1),
                        (SELECT se.uid
                         FROM schedules_event se
                         WHERE se.schedule_id = ${Schedule.id}
                           AND se.start_ts <= ${now}
                           AND se.end_ts >= ${now}
                         LIMIT 1)
                    )
                )`.as('oncall_uid'),
                oncall_fname: sql<string | null>`(
                    SELECT COALESCE(
                        (SELECT COALESCE(u2.fname, u1.fname)
                         FROM schedules_override so
                         LEFT JOIN users u1 ON u1.id = so.uid
                         LEFT JOIN users u2 ON u2.id = so.override_uid
                         WHERE so.schedule_id = ${Schedule.id}
                           AND so.start_ts <= ${now}
                           AND so.end_ts >= ${now}
                         LIMIT 1),
                        (SELECT u.fname
                         FROM schedules_event se
                         LEFT JOIN users u ON u.id = se.uid
                         WHERE se.schedule_id = ${Schedule.id}
                           AND se.start_ts <= ${now}
                           AND se.end_ts >= ${now}
                         LIMIT 1)
                    )
                )`.as('oncall_fname'),
                oncall_lname: sql<string | null>`(
                    SELECT COALESCE(
                        (SELECT COALESCE(u2.lname, u1.lname)
                         FROM schedules_override so
                         LEFT JOIN users u1 ON u1.id = so.uid
                         LEFT JOIN users u2 ON u2.id = so.override_uid
                         WHERE so.schedule_id = ${Schedule.id}
                           AND so.start_ts <= ${now}
                           AND so.end_ts >= ${now}
                         LIMIT 1),
                        (SELECT u.lname
                         FROM schedules_event se
                         LEFT JOIN users u ON u.id = se.uid
                         WHERE se.schedule_id = ${Schedule.id}
                           AND se.start_ts <= ${now}
                           AND se.end_ts >= ${now}
                         LIMIT 1)
                    )
                )`.as('oncall_lname')
            })
            .from(Schedule)
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedSchedule>;
    }
}
