function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE issues_assigned
            ADD COLUMN visible BOOLEAN NOT NULL DEFAULT True;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
