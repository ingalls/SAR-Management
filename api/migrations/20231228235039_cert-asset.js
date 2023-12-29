function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE certs
            ADD COLUMN asset BIGINT NOT NULL REFERENCES assets(id);
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
