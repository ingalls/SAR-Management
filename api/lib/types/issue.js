import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Issue extends Generic {
    static _table = 'issues';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        query.assigned = Params.integer(query.assigned);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    issues.*
                FROM
                    issues
                        LEFT JOIN issues_assigned
                            ON issues.id = issues_assigned.issue_id
                WHERE
                    (${query.filter}::TEXT IS NULL OR title ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR issues_assigned.uid = ${query.assigned})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Issues');
        }
    }
}
