function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE fieldability (
            id          BIGSERIAL PRIMARY KEY,
            name        TEXT NOT NULL DEFAULT '',
            team        BIGINT NOT NULL REFERENCES teams(id)
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
