function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE equipment
            ADD COLUMN description TEXT NOT NULL DEFAULT '';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
