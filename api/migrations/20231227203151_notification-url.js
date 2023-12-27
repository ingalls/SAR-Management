function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE notifications
            ADD COLUMN url TEXT;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
