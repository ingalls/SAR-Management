function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE schedule (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            updated     TIMESTAMPTZ NOT NULL DEFAULT Now(),
            name        TEXT UNIQUE NOT NULL
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
