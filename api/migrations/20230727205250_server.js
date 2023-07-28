function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE server (
            key         TEXT PRIMARY KEY,
            value       JSON NOT NULL,
            public      BOOLEAN NOT NULL DEFAULT False
        );

        INSERT INTO server (key, value, public) VALUES (
            'name',
            '"Default Team"'::JSON,
            True
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
