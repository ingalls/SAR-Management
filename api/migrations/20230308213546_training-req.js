function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE training
            ADD COLUMN required BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
