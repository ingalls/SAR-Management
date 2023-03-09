import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Equipment extends Generic {
    static _table = 'equipment';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        query.assigned = Params.integer(query.assigned);
        query.parent = Params.integer(query.parent);
        query.container = Params.boolean(query.container);
        query.archived = Params.boolean(query.archived);

        query.start = Params.timestamp(query.timestamp);
        query.end = Params.timestamp(query.timestamp);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    equipment.*
                FROM
                    equipment
                        LEFT JOIN equipment_assigned
                            ON equipment.id = equipment_assigned.equip_id
                WHERE
                    (
                        (${query.parent}::BIGINT IS NULL)
                        OR (${query.parent}::BIGINT = 0 AND parent IS NULL)
                        OR (${query.parent}::BIGINT IS NOT NULL AND parent = ${query.parent}::BIGINT)
                    )
                    AND (${query.container}::BOOLEAN IS NULL OR container = ${query.container})
                    AND (${query.archived}::BOOLEAN IS NULL OR archived = ${query.archived})
                    AND (${query.filter}::TEXT IS NULL OR name ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR equipment_assigned.uid = ${query.assigned})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Equipment');
        }
    }
}

