import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, MissionAssigned } from '../schema.js';
import { sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedMissionAssigned = Type.Object({
    id: Type.Integer(),
    mission_id: Type.Integer(),
    uid: Type.Integer(),
    confirmed: Type.Boolean(),
    role: Type.String(),
    fname: Type.String(),
    lname: Type.String(),
    username: Type.String()
})

export default class MissionAssignedModel extends Modeler<typeof MissionAssigned> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, MissionAssigned);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedMissionAssigned>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: MissionAssigned.id,
                mission_id: MissionAssigned.mission_id,
                confirmed: MissionAssigned.confirmed,
                role: MissionAssigned.role,
                uid: MissionAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(MissionAssigned)
            .leftJoin(User, eq(MissionAssigned.uid, User.id))
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
                    return t as Static<typeof AugmentedMissionAssigned>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedMissionAssigned>> {
        const pgres = await this.pool
            .select({
                id: MissionAssigned.id,
                mission_id: MissionAssigned.mission_id,
                confirmed: MissionAssigned.confirmed,
                role: MissionAssigned.role,
                uid: MissionAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(MissionAssigned)
            .leftJoin(User, eq(MissionAssigned.uid, User.id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedMissionAssigned>;
    }
}
