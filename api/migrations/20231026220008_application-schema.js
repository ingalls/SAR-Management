function up(knex) {
    return knex.schema.raw(`
        DELETE FROM applications;
        ALTER TABLE applications
            ADD COLUMN schema JSON NOT NULL;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
