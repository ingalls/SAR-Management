function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE poll (
            id          BIGSERIAL PRIMARY KEY,
            expiry      TIMESTAMPTZ
        );

        CREATE TABLE poll_questions (
            id              BIGSERIAL PRIMARY KEY,
            poll_id         BIGINT NOT NULL REFERENCES poll(id),
            question        JSONB NOT NULL
        );

        CREATE TABLE poll_votes (
            uid             BIGINT NOT NULL REFERENCES users(id),
            poll_id         BIGINT NOT NULL REFERENCES poll(id),
            question_id     BIGINT NOT NULL REFERENCES poll_questions(id),

            CONSTRAINT users_vote_unique UNIQUE (uid, poll_id, question_id)
        );

    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
