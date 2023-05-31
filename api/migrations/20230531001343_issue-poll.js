function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE issues
            ADD COLUMN poll_id BIGINT REFERENCES poll(id);
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
