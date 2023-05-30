function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE missions
            ADD COLUMN externalid TEXT DEFAULT '';

        UPDATE missions_assigned
            SET
                role = 'Present'
            WHERE
                role = 'present';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
