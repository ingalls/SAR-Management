import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Notification extends Generic {
    static _table = 'notifications';

    static async list(pool, uid, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);
        query.uid = Params.integer(uid);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    notifications.*
                FROM
                    notifications
                WHERE
                    ${query.uid}::BIGINT = notifications.uid
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Notifications');
        }
    }

    static async users(pool, type, perms) {
        type = Params.string(type);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    users.id,
                    users.username,
                    users.email,
                    users.fname,
                    users.lname,
                    teams.perm
                FROM
                    (
                        SELECT
                            id,
                            COALESCE(iam->>${type}::TEXT, 'None') AS perm
                        FROM
                            teams
                        WHERE
                            COALESCE(iam->>'Application', 'None') = ANY(${sql.array(perms, sql`text[]`)}::TEXT[])
                    ) AS teams
                        LEFT JOIN
                            users_to_teams
                                ON teams.id = users_to_teams.tid
                        LEFT JOIN
                            users
                                ON users.id = users_to_teams.uid
            `);
            return this.deserialize_list(pgres, 'users');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Notify List');
        }
    }
}

