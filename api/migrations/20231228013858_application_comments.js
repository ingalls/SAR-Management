function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE application_comments (
            id          BIGSERIAL PRIMARY KEY,
            application BIGINT NOT NULL REFERENCES applications(id),
            created     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            updated     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            body        TEXT NOT NULL,
            author      BIGINT NOT NULL REFERENCES users(id),
            archived    BOOLEAN NOT NULL DEFAULT false
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
