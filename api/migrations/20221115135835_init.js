function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE users (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            disabled    BOOLEAN NOT NULL DEFAULT False,
            access      TEXT NOT NULL DEFAULT 'user',
            username    TEXT NOT NULL,
            email       TEXT NOT NULL,
            password    TEXT NOT NULL,
            fname       TEXT NOT NULL,
            lname       TEXT NOT NULL,
            validated   BOOLEAN NOT NULL DEFAULT False,

            CONSTRAINT users_username UNIQUE (username),
            CONSTRAINT users_email UNIQUE (email)
        );

        CREATE TABLE issues (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            status      TEXT NOT NULL DEFAULT 'open',
            title       TEXT NOT NULL,
            body        TEXT NOT NULL,
            author      BIGINT NOT NULL REFERENCES users(id)
        );

        CREATE TABLE issues_comments (
            id          BIGSERIAL PRIMARY KEY,
            issue       BIGINT REFERENCES issues(id),
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            body        TEXT NOT NULL,
            author      BIGINT NOT NULL REFERENCES users(id)
        );

        CREATE TABLE documents (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            title       TEXT NOT NULL,
            url         TEXT NOT NULL
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
