function up(knex) {
    return knex.schema.raw(`
        CREATE VIEW view_training AS
            SELECT
                count(*) OVER() AS count,
                training.*,
                COALESCE(tt.teams, '[]'::JSON) AS teams
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
