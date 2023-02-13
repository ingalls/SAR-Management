function up(knex) {
    return knex.schema.raw(`
        DROP TABLE documents;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
