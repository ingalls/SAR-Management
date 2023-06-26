function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE teams
            ADD COLUMN colour_bg TEXT NOT NULL DEFAULT '#808080';
        ALTER TABLE teams
            ADD COLUMN colour_txt TEXT NOT NULL DEFAULT '#00000t';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
