import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class TrainingAssigned extends Generic {
    static _table = 'training_assigned';

    static async list(pool, training_id, query) {
        training_id = Params.integer(training_id);

        query.limit = Params.integer(query.limit, { default: 100 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'id' });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    training_assigned.*,
                    users.fname,
                    users.lname,
                    users.username
                FROM
                    ${sql.identifier([this._table])}
                        LEFT JOIN users
                            ON training_assigned.uid = users.id
                WHERE
                    training_id = ${training_id}
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'assigned');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Training Asignees');
        }
    }
}
