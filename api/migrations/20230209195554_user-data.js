function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE users
            ADD COLUMN start_year INT;
        ALTER TABLE users
            ADD COLUMN emergency JSONB NOT NULL DEFAULT '[]'::JSONB;
        ALTER TABLE users
            ADD COLUMN address_street TEXT NOT NULL DEFAULT '';
        ALTER TABLE users
            ADD COLUMN address_city TEXT NOT NULL DEFAULT '';
        ALTER TABLE users
            ADD COLUMN address_state TEXT NOT NULL DEFAULT 'Colorado';
        ALTER TABLE users
            ADD COLUMN address_zip TEXT NOT NULL DEFAULT '';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
