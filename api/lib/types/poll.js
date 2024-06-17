import Generic from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Poll extends Generic {
    static _table = 'poll';

    static async from(pool, id) {
        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    poll.*,
                    pq.questions AS questions,
                    pv.votes AS votes
                FROM
                    poll
                        LEFT JOIN
                            (
                                SELECT
                                    poll_id,
                                    JSON_AGG(ROW_TO_JSON(poll_questions.*)) AS questions
                                FROM
                                    poll_questions
                                WHERE
                                    poll_id = ${id}
                                GROUP BY
                                    poll_id

                            ) pq ON poll.id = pq.poll_id
                        LEFT JOIN
                            (
                                SELECT
                                    MAX(poll_id) AS poll_id,
                                    JSON_AGG(ROW_TO_JSON(pi.*)) AS votes
                                FROM (
                                    SELECT
                                        MAX(poll_id) AS poll_id,
                                        question_id,
                                        count(*) AS votes
                                    FROM
                                        poll_votes
                                    WHERE
                                        poll_id = ${id}
                                    GROUP BY
                                        question_id
                                ) pi
                                GROUP BY
                                    question_id

                            ) pv ON poll.id = pv.poll_id
                WHERE
                    poll.id = ${id}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to load Poll');
        }

        return this.deserialize(pool, pgres);
    }
}
