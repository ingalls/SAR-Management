import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class TrainingAssigned extends Generic {
    static _table = 'training_assigned';

    static async list(pool, training_id, query) {
        training_id = Params.integer(training_id);

        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    *
                FROM
                    ${sql.identifier([this._table])}
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
