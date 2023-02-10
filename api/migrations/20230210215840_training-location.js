function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE training
            ADD COLUMN location TEXT NOT NULL DEFAULT '';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
