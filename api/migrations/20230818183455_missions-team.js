function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE missions_team (
            id              BIGSERIAL PRIMARY KEY,
            mission_id      BIGINT NOT NULL REFERENCES missions(id),
            team_id         BIGINT NOT NULL REFERENCES teams(id),

            CONSTRAINT unique_mission_teams UNIQUE(mission_id, team_id)
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
