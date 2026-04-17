import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, ScheduleOverride } from '../schema.js';
import { sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedScheduleOverride = Type.Object({
    id: Type.Integer(),
    schedule_id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    uid: Type.Integer(),
    uid_fname: Type.String(),
    uid_lname: Type.String(),
    override_uid: Type.Union([Type.Integer(), Type.Null()]),
    override_fname: Type.Union([Type.String(), Type.Null()]),
    override_lname: Type.Union([Type.String(), Type.Null()]),
    reason: Type.String(),
    created_by: Type.Integer(),
})

export default class ScheduleOverrideModel extends Modeler<typeof ScheduleOverride> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, ScheduleOverride);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedScheduleOverride>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const OverrideUser = User;

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ScheduleOverride.id,
                schedule_id: ScheduleOverride.schedule_id,
                created: ScheduleOverride.created,
                updated: ScheduleOverride.updated,
                start_ts: ScheduleOverride.start_ts,
                end_ts: ScheduleOverride.end_ts,
                uid: ScheduleOverride.uid,
                uid_fname: sql<string>`u1.fname`.as('uid_fname'),
                uid_lname: sql<string>`u1.lname`.as('uid_lname'),
                override_uid: ScheduleOverride.override_uid,
                override_fname: sql<string | null>`u2.fname`.as('override_fname'),
                override_lname: sql<string | null>`u2.lname`.as('override_lname'),
                reason: ScheduleOverride.reason,
                created_by: ScheduleOverride.created_by,
            })
            .from(ScheduleOverride)
            .leftJoin(sql`users u1`, sql`u1.id = ${ScheduleOverride.uid}`)
            .leftJoin(sql`users u2`, sql`u2.id = ${ScheduleOverride.override_uid}`)
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
                    return t as Static<typeof AugmentedScheduleOverride>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedScheduleOverride>> {
        const pgres = await this.pool
            .select({
                id: ScheduleOverride.id,
                schedule_id: ScheduleOverride.schedule_id,
                created: ScheduleOverride.created,
                updated: ScheduleOverride.updated,
                start_ts: ScheduleOverride.start_ts,
                end_ts: ScheduleOverride.end_ts,
                uid: ScheduleOverride.uid,
                uid_fname: sql<string>`u1.fname`.as('uid_fname'),
                uid_lname: sql<string>`u1.lname`.as('uid_lname'),
                override_uid: ScheduleOverride.override_uid,
                override_fname: sql<string | null>`u2.fname`.as('override_fname'),
                override_lname: sql<string | null>`u2.lname`.as('override_lname'),
                reason: ScheduleOverride.reason,
                created_by: ScheduleOverride.created_by,
            })
            .from(ScheduleOverride)
            .leftJoin(sql`users u1`, sql`u1.id = ${ScheduleOverride.uid}`)
            .leftJoin(sql`users u2`, sql`u2.id = ${ScheduleOverride.override_uid}`)
            .where(is(id, SQL) ? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedScheduleOverride>;
    }
}
