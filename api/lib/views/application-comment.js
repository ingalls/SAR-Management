import Generic, { Params } from '@openaddresses/batch-generic';
import { sql } from 'slonik';
import Err from '@openaddresses/batch-error';

export default class ApplicationComment extends Generic {
    static _view = 'view_application_comments';

    static async list(pool, app_id, query) {
        app_id = Params.integer(app_id);

        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);
        query.archived = Params.boolean(query.archived, { default: false });

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    *
                FROM
                    ${sql.identifier([this._view])}
                WHERE
                    application = ${app_id}
                    AND archived = ${query.archived}::BOOLEAN
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'application_comments');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Application Comments');
        }
    }
}
