import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, ScheduleAssigned } from '../schema.js';
import { sql, eq, asc, desc } from 'drizzle-orm';

export const AugmentedScheduleAssigned = Type.Object({
    id: Type.Integer(),
    schedule_id: Type.Integer(),
    uid: Type.Integer(),
    fname: Type.String(),
    lname: Type.String(),
    username: Type.String()
})

export default class ScheduleAssignedModel extends Modeler<typeof ScheduleAssigned> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, ScheduleAssigned);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedScheduleAssigned>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ScheduleAssigned.id,
                schedule_id: ScheduleAssigned.schedule_id,
                uid: ScheduleAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(ScheduleAssigned)
            .leftJoin(User, eq(ScheduleAssigned.uid, User.id))
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
                    delete t.count;
                    return t as Static<typeof AugmentedScheduleAssigned>
                })
            };
        }
    }
}
