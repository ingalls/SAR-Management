function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE assets (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            name        TEXT NOT NULL,
            storage     BOOLEAN NOT NULL DEFAULT False
        );

        CREATE TABLE teams (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            name        TEXT NOT NULL,
            body        TEXT NOT NULL
        );

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
            phone       TEXT NOT NULL,
            validated   BOOLEAN NOT NULL DEFAULT False,
            profile_id  BIGINT REFERENCES assets(id),

            CONSTRAINT users_username UNIQUE (username),
            CONSTRAINT users_email UNIQUE (email)
        );

        CREATE TABLE users_to_teams (
            uid         BIGINT NOT NULL REFERENCES users(id),
            tid         BIGINT NOT NULL REFERENCES teams(id)
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

        CREATE TABLE leadership (
            id          BIGSERIAL PRIMARY KEY,
            name        TEXT NOT NULL,
            uid         BIGINT REFERENCES users(id)
        );

        CREATE TABLE missions (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            start_ts    TIMESTAMP NOT NULL,
            end_ts      TIMESTAMP NOT NULL,
            status      TEXT NOT NULL DEFAULT 'open',
            title       TEXT NOT NULL,
            author      BIGINT NOT NULL REFERENCES users(id)
        );

        CREATE TABLE equipment (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            status      TEXT NOT NULL DEFAULT 'open',
            name        TEXT NOT NULL
        );

        CREATE TABLE notifications (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            uid         BIGINT REFERENCES users(id),
            text        TEXT NOT NULL
        );

        CREATE TABLE training (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            author      BIGINT NOT NULL REFERENCES users(id),
            start_ts    TIMESTAMP NOT NULL,
            end_ts      TIMESTAMP NOT NULL,
            title       TEXT NOT NULL,
            body        TEXT NOT NULL
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
