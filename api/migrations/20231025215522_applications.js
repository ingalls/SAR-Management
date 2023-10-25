function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE applications (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            updated     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            name        TEXT NOT NULL,
            phone       TEXT NOT NULL,
            email       TEXT NOT NULL,
            meta        JSON NOT NULL DEFAULT '{}'::JSON
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
