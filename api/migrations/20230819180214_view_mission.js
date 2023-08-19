function up(knex) {
    return knex.schema.raw(`
        CREATE VIEW view_mission AS
            SELECT
                missions.*,
                ma.users,
                COALESCE(mt.teams, '[]'::JSON) AS teams,
                COALESCE(mt.teams_id, '{}'::BIGINT[]) AS teams_id
            FROM
                missions
                    LEFT JOIN
                        (
                            SELECT
                                mission_id,
                                ARRAY_AGG(uid) AS users
                            FROM
                                missions_assigned
                            GROUP BY
                                mission_id
                        ) ma
                            ON missions.id = ma.mission_id
                    LEFT JOIN
                        (
                            SELECT
                                mission_id,
                                ARRAY_AGG(teams.id) AS teams_id,
                                JSON_AGG(teams.*) AS teams
                            FROM
                                missions_team
                                LEFT JOIN teams ON teams.id = missions_team.team_id
                            GROUP BY
                                mission_id
                        ) mt
                            ON missions.id = mt.mission_id
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
