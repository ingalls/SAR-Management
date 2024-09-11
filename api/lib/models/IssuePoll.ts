import Modeler from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Poll, PollQuestion, PollVote } from '../schema.js';
import { sql, eq, is, SQL } from 'drizzle-orm';

const AugmentedPollQuestion = Type.Object({
    id: Type.Integer(),
    poll_id: Type.Integer(),
    question: Type.String()
})

export const AugmentedPoll = Type.Object({
    id: Type.Integer(),
    expiry: Type.String(),
    questions: Type.Array(AugmentedPollQuestion),
    votes: Type.Array(Type.Object({
        question_id: Type.Integer(),
        votes: Type.Integer()
    }))
});

export default class PollModel extends Modeler<typeof Poll> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Poll);
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedPoll>> {
        const pgres = await this.pool
            .execute(sql`
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
            `)
        if (pgres.length === 0) {
            throw new Err(404, null, 'Poll Not Found');
        }

        return {
            id: pgres[0].id,
            expiry: pgres[0].expiry,
            questions: pgres[0].questions.map((q: any) => {
                return {
                    ...q,
                    question: JSON.parse(q.question)
                }
            }),
            votes: pgres[0].votes || []
        }
    }
}
