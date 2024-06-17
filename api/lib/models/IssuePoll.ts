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
            .select({
                id: Poll.id,
                expiry: Poll.expiry,
                questions: sql<Array<Static<typeof AugmentedPollQuestion>>>`JSON_AGG(ROW_TO_JSON(poll_questions.*))`.as('questions'),
                votes: PollVote
            })
            .from(Poll)
            .leftJoin(PollVote, eq(Poll.id, PollVote.poll_id))
            .leftJoin(PollQuestion, eq(Poll.id, PollVote.poll_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .groupBy(PollVote.question_id);

        if (pgres.length === 0) {
            throw new Err(404, null, 'Poll Not Found');
        }

        // TODO Add Vote info
        return {
            id: pgres[0].id,
            expiry: pgres[0].expiry,
            questions: pgres[0].questions,
            votes: []
        }
    }
}
