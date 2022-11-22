import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

export default class User extends Generic {
    static _table = 'users';

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
