import Generic from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

/**
 * @class
 */
export default class Total extends Generic {
    static _table = 'total';

    static async list(pool, query={}) {
        try {
            const pgres = await pool.query(sql`
                SELECT
                    dt,
                    count
                FROM
                    total
                ORDER BY
                    dt DESC
            `);

            return {
                totals: pgres.rows
            }
        } catch (err) {
            throw new Err(500, err, 'Failed to list totals');
        }
    }
}
