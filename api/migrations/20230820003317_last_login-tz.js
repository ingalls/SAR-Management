function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE users
            ALTER COLUMN last_login TYPE timestamptz
                USING last_login::timestamptz;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
