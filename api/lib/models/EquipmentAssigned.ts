import Modeler, { Param, GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, EquipmentAssigned } from '../schema.js';
import { InferSelectModel, sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedEquipmentAssigned = Type.Object({
    id: Type.Integer(),
    equip_id: Type.Integer(),
    uid: Type.Integer(),
    fname: Type.String(),
    lname: Type.String(),
    username: Type.String()
})

export default class EquipmentAssignedModel extends Modeler<typeof EquipmentAssigned> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, EquipmentAssigned);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedEquipmentAssigned>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: EquipmentAssigned.id,
                equip_id: EquipmentAssigned.equip_id,
                uid: EquipmentAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(EquipmentAssigned)
            .leftJoin(User, eq(EquipmentAssigned.uid, User.id))
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
                    return t as Static<typeof AugmentedEquipmentAssigned>
                })
            };
        }
    }
}
