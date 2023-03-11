function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE equipment
            ADD COLUMN quantity INT NOT NULL DEFAULT 1;
        ALTER TABLE equipment
            ADD COLUMN VALUE INT;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
