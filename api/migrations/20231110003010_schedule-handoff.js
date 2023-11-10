function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE schedule
            ADD COLUMN handoff TEXT NOT NULL DEFAULT '06:00'
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
