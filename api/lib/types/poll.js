import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Poll extends Generic {
    static _table = 'poll';

    static async from(pool, id) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    *
                FROM
                    poll
                        LEFT JOIN poll_questions
                        ON poll.id = poll_questions.poll_id
                WHERE
                    id = ${id}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to load Poll');
        }

        return this.deserialize(pool, pgres);
    }
}
