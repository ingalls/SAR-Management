function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE equipment
            ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
