function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE equipment_types (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            type        TEXT NOT NULL,
            schema      JSONB
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
