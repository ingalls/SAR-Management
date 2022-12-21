import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class User extends Generic {
    static _table = 'users';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    users.*
                FROM
                    users
                WHERE
                    (${query.filter}::TEXT IS NULL OR fname||' '||lname ~* ${query.filter})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Users');
        }
    }

    static async list_bday(pool, query) {
        query.start_bday = Params.timestamp(query.start_bday);
        query.end_bday = Params.timestamp(query.end_bday);

        if (query.start_bday) query.start_bday = query.start_bday.split('T')[0]
        if (query.end_bday) query.end_bday = query.end_bday.split('T')[0]

        try {
            const pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    users
                WHERE
                    indexable_month_day(bday) >= indexable_month_day(${query.start_bday}::DATE)
                ORDER BY
                    ${sql.identifier([this._table, 'bday'])} ASC
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Users');
        }
    }


    static async from_username(pool, username) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    users
                WHERE
                    username = ${username}
                    OR email = ${username}
            `);
        } catch (err) {
            throw new Err(500, err, 'Internal Login Error');
        }

        if (pgres.rows.length === 0) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        return this.deserialize(pool, pgres);
    }
}
