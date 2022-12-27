import Generic, { Params } from '@openaddresses/batch-generic';
import { sql } from 'slonik';
import Err from '@openaddresses/batch-error';

export default class IssueComment extends Generic {
    static _view = 'view_issues_comments';

    static async list(pool, issue_id, query) {
        issue_id = Params.integer(issue_id);

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
                    ${sql.identifier([this._view])}
                WHERE
                    issue = ${issue_id}
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'issues_comments');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Issue Comments');
        }
    }
}
