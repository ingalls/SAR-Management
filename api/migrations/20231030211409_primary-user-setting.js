function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE user_settings
            DROP CONSTRAINT user_settings_pkey;

        ALTER TABLE user_settings
            ADD COLUMN id BIGSERIAL PRIMARY KEY;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
