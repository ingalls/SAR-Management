import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class IssueAssigned extends Generic {
    static _table = 'issues_assigned';

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
                    issues_assigned.*,
                    users.fname,
                    users.lname,
                    users.username
                FROM
                    ${sql.identifier([this._table])}
                        LEFT JOIN users
                            ON issues_assigned.uid = users.id
                WHERE
                    issue_id = ${issue_id}
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'assigned');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Issue Asignees');
        }
    }
}
