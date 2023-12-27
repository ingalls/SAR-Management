function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE issues_comments
            ADD COLUMN archived BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
