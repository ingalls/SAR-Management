import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Equipment, EquipmentAssigned, User } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

export const Assigned = Type.Object({
    id: Type.Integer(),
    fname: Type.String(),
    lname: Type.String()
});

export const AugmentedEquipment = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    status: Type.String(),
    name: Type.String(),
    description: Type.String(),
    type_id: Type.Integer(),
    container: Type.Boolean(),
    parent: Type.Integer(),
    meta: Type.Any(),
    archived: Type.Boolean(),
    quantity: Type.Integer(),
    value: Type.Integer(),
    assigned: Type.Array(Assigned)
});

export default class EquipmentModel extends Modeler<typeof Equipment> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Equipment);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedEquipment>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootAssigned = this.pool
            .select({
                assigned_equip_id: max(EquipmentAssigned.equip_id).as('assigned_equip_id'),
                assigned_ids: sql<Array<number>>`coalesce(array_agg(equipment_assigned.uid), '{}'::INT[])`.as('assigned_ids'),
                assigned: sql<Array<Static<typeof Assigned>>>`json_agg(json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname))`.as('assigned')
            })
            .from(EquipmentAssigned)
            .leftJoin(User, eq(EquipmentAssigned.uid, User.id))
            .groupBy(EquipmentAssigned.equip_id)
            .as("root_assigned");

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: Equipment.id,
                created: Equipment.created,
                updated: Equipment.updated,
                status: Equipment.status,
                name: Equipment.name,
                description: Equipment.description,
                type_id: Equipment.type_id,
                container: Equipment.container,
                parent: Equipment.parent,
                meta: Equipment.meta,
                archived: Equipment.archived,
                quantity: Equipment.quantity,
                value: Equipment.value,
                assigned: RootAssigned.assigned
            })
            .from(Equipment)
            .leftJoin(RootAssigned, eq(Equipment.id, RootAssigned.assigned_equip_id))
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
                    if (!t.assigned) t.assigned = [];
                    return t as Static<typeof AugmentedEquipment>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedEquipment>> {
        const RootAssigned = this.pool
            .select({
                assigned_equip_id: max(EquipmentAssigned.equip_id).as('assigned_equip_id'),
                assigned_ids: sql<Array<number>>`coalesce(array_agg(equipment_assigned.uid), '{}'::INT[])`.as('assigned_ids'),
                assigned: sql<Array<Static<typeof Assigned>>>`json_agg(json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname))`.as('assigned')
            })
            .from(EquipmentAssigned)
            .leftJoin(User, eq(EquipmentAssigned.uid, User.id))
            .groupBy(EquipmentAssigned.equip_id)
            .as("root_assigned");

        const pgres = await this.pool
            .select({
                id: Equipment.id,
                created: Equipment.created,
                updated: Equipment.updated,
                status: Equipment.status,
                name: Equipment.name,
                description: Equipment.description,
                type_id: Equipment.type_id,
                container: Equipment.container,
                parent: Equipment.parent,
                meta: Equipment.meta,
                archived: Equipment.archived,
                quantity: Equipment.quantity,
                value: Equipment.value,
                assigned: RootAssigned.assigned
            })
            .from(Equipment)
            .leftJoin(RootAssigned, eq(Equipment.id, RootAssigned.assigned_equip_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        if (!pgres[0].assigned) pgres[0].assigned = [];

        return pgres[0] as Static<typeof AugmentedEquipment>;
    }
}
