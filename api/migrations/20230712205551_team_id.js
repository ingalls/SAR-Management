function up(knex) {
    return knex.schema.raw(`
        DROP VIEW view_training;

        CREATE VIEW view_training AS
            SELECT
                training.*,
                ta.users,
                COALESCE(tt.teams, '[]'::JSON) AS teams,
                COALESCE(tt.teams_id, '{}'::BIGINT[]) AS teams_id
            FROM
                training
                    LEFT JOIN
                        (
                            SELECT
                                training_id,
                                ARRAY_AGG(uid) AS users
                            FROM
                                training_assigned
                            GROUP BY
                                training_id
                        ) ta
                            ON training.id = ta.training_id
                    LEFT JOIN
                        (
                            SELECT
                                training_id,
                                ARRAY_AGG(teams.id) AS teams_id,
                                JSON_AGG(teams.*) AS teams
                            FROM
                                trainings_team
                                LEFT JOIN teams ON teams.id = trainings_team.team_id
                            GROUP BY
                                training_id
                        ) tt
                            ON training.id = tt.training_id
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
