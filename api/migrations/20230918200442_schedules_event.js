function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE schedules_event (
            id              BIGSERIAL PRIMARY KEY,
            schedule_id     BIGINT NOT NULL REFERENCES schedule(id),
            start_ts        TIMESTAMP NOT NULL,
            end_ts          TIMESTAMP NOT NULL,
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
