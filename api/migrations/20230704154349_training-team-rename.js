function up(knex) {
    return knex.schema.raw(`
        DROP TABLE trainings_team;
        CREATE TABLE trainings_team (
            id              BIGSERIAL PRIMARY KEY,
            training_id     BIGINT NOT NULL REFERENCES training(id),
            team_id         BIGINT NOT NULL REFERENCES teams(id),

            CONSTRAINT unique_teams UNIQUE(training_id, team_id)
        );
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
