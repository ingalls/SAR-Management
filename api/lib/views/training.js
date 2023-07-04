import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class ViewTraining extends Generic {
    static _view = 'view_training';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        query.assigned = Params.integer(query.assigned);
        query.required = Params.boolean(query.required);
        query.start = Params.timestamp(query.start);
        query.end = Params.timestamp(query.end);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    view_training.*
                FROM
                    view_training
                WHERE
                    (${query.filter}::TEXT IS NULL OR title ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR users @> ARRAY[${query.assigned}::BIGINT])
                    AND (${query.required}::BOOLEAN IS NULL OR required = ${query.required}::BOOLEAN)
                    AND (${query.start}::TIMESTAMP IS NULL OR start_ts >= ${query.start}::TIMESTAMP)
                    AND (${query.end}::TIMESTAMP IS NULL OR end_ts <= ${query.end}::TIMESTAMP)
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'training');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Trainings');
        }
    }
}
