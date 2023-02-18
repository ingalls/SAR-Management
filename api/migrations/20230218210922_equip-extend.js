function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE equipment
            ADD COLUMN type_id BIGINT REFERENCES equipment_types(id);
        ALTER TABLE equipment
            ADD COLUMN container BOOLEAN NOT NULL DEFAULT False;
        ALTER TABLE equipment
            ADD COLUMN container_parent BIGINT REFERENCES equipment(id);
        ALTER TABLE equipment
            ADD COLUMN meta JSONB NOT NULL DEFAULT '{}'::JSONB;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
