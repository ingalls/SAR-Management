function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE equipment
            RENAME COLUMN container_parent TO parent;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
