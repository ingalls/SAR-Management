function up(knex) {
    return knex.schema.raw(`
        CREATE EXTENSION IF NOT EXISTS POSTGIS;
        ALTER TABLE training
            ADD COLUMN location_geom GEOMETRY(POINT, 4326);
        ALTER TABLE missions
            ADD COLUMN location_geom GEOMETRY(POINT, 4326);
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
