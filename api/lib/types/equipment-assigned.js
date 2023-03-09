import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class EquipmentAssigned extends Generic {
    static _table = 'equipment_assigned';

    static async list(pool, equip_id, query) {
        equip_id = Params.integer(equip_id);

        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    equipment_assigned.*,
                    users.fname,
                    users.lname,
                    users.username
                FROM
                    ${sql.identifier([this._table])}
                        LEFT JOIN users
                            ON equipment_assigned.uid = users.id
                WHERE
                    equip_id = ${equip_id}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}

            `);

            return this.deserialize_list(pgres, 'assigned');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Equipment Asignees');
        }
    }
}
