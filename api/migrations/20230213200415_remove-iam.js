function up(knex) {
    return knex.schema.raw(`
        DROP TABLE iam;

        ALTER TABLE teams
            ADD COLUMN iam JSONB NOT NULL DEFAULT '{}';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
