function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE leadership
            RENAME COLUMN name TO position;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
