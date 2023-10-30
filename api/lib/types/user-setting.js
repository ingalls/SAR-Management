import Generic from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class User extends Generic {
    static _table = 'user_settings';

    static async from(pool, uid, key) {
        let pgres;

        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    user_settings
                WHERE
                    uid = ${uid}
                    AND key = ${key}
            `);

            if (!pgres.rows.length) return {
                uid, key, value: {}
            };

            return this.deserialize(pool, pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to load User Setting');
        }
    }
}
