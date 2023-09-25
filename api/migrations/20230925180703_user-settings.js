function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE user_settings (
            uid         BIGINT NOT NULL REFERENCES users(id),
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
