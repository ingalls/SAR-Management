function up(knex) {
    return knex.schema.raw(`
        CREATE VIEW view_locations AS
            SELECT
                loc_idx,
                location,
                location_geom
            FROM (
                    (
                        SELECT
                            location,
                            LOWER(location) AS loc_idx,
                            location_geom
                        FROM
                            missions
                        WHERE
                            location_geom IS NOT NULL
                            AND Length(Trim(location)) > 0
                    ) UNION (
                        SELECT
                            location,
                            LOWER(location) AS loc_idx,
                            location_geom
                        FROM
                            training
                        WHERE
                            location_geom IS NOT NULL
                            AND Length(Trim(location)) > 0
                    )
                ) m

    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
