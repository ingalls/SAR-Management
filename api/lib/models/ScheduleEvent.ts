import Modeler, { Param, GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, ScheduleEvent } from '../schema.js';
import { InferSelectModel, sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedScheduleEvent = Type.Object({
    id: Type.Integer(),
    fname: Type.String(),
    lname: Type.String(),
    schedule_id: Type.Integer(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    uid: Type.Integer()
})

export default class ScheduleEventModel extends Modeler<typeof ScheduleEvent> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, ScheduleEvent);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedScheduleEvent>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ScheduleEvent.id,
                fname: User.fname,
                lname: User.lname,
                schedule_id: ScheduleEvent.schedule_id,
                start_ts: ScheduleEvent.start_ts,
                end_ts: ScheduleEvent.end_ts,
                uid: ScheduleEvent.uid
            })
            .from(ScheduleEvent)
            .leftJoin(User, eq(User.id, ScheduleEvent.uid))
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
                    return t as Static<typeof AugmentedScheduleEvent>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedScheduleEvent>> {
        const pgres = await this.pool
            .select({
                id: ScheduleEvent.id,
                fname: User.fname,
                lname: User.lname,
                schedule_id: ScheduleEvent.schedule_id,
                start_ts: ScheduleEvent.start_ts,
                end_ts: ScheduleEvent.end_ts,
                uid: ScheduleEvent.uid
            })
            .from(ScheduleEvent)
            .leftJoin(User, eq(User.id, ScheduleEvent.uid))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedScheduleEvent>;
    }
}
