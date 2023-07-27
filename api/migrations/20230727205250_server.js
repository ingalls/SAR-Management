function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE server (
            key         TEXT PRIMARY KEY,
            value       JSONB NOT NULL
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
