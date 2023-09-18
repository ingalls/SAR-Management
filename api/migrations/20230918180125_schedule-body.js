function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE schedule
            ADD COLUMN body TEXT NOT NULL DEFAULT '';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
