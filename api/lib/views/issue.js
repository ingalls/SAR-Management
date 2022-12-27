import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class ViewIssue extends Generic {
    static _view = 'view_issues';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        query.assigned = Params.integer(query.assigned);
        query.status = Params.string(query.status);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    view_issues.*
                FROM
                    view_issues
                        LEFT JOIN issues_assigned
                            ON view_issues.id = issues_assigned.issue_id
                WHERE
                    (${query.filter}::TEXT IS NULL OR title ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR issues_assigned.uid = ${query.assigned})
                    AND (${query.status}::TEXT IS NULL OR view_issues.status = ${query.status})
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'issues');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Issues');
        }
    }
}
