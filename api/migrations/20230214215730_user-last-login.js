function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE users
            ADD COLUMN last_login TIMESTAMP;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
