function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE schedules_assigned (
            id              BIGSERIAL PRIMARY KEY,
            schedule_id     BIGINT NOT NULL REFERENCES schedule(id),
            role            TEXT NOT NULL,
            uid             BIGINT NOT NULL REFERENCES users(id)
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
