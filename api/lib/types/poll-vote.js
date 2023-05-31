import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class PollVote extends Generic {
    static _table = 'poll_votes';

    static async from(pool, uid, poll_id) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    poll_votes.*
                FROM
                    poll_votes
                WHERE
                    uid = ${uid}
                    AND poll_id = ${poll_id}
            `);

            return this.deserialize(pool, pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to load Poll Vote');
        }
    }
}
