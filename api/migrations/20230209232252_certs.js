function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE certs_known (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            name        TEXT NOT NULL DEFAULT Now()
        );

        INSERT INTO certs_known (name) VALUES ('Wilderness First Responder');
        INSERT INTO certs_known (name) VALUES ('Wilderness First Aid');
        INSERT INTO certs_known (name) VALUES ('EMT');
        INSERT INTO certs_known (name) VALUES ('Paramedic');
        INSERT INTO certs_known (name) VALUES ('ICS-100 - Intro to ICS');
        INSERT INTO certs_known (name) VALUES ('ICS-200 - Basic ICS for Initial Response');
        INSERT INTO certs_known (name) VALUES ('ICS-300 - ICS for Expanding Incidents');
        INSERT INTO certs_known (name) VALUES ('ICS-400 - Advanced ICS');
        INSERT INTO certs_known (name) VALUES ('IS-700 - National Incident');
        INSERT INTO certs_known (name) VALUES ('ICS-800 - Intro to National Response Framework');

        CREATE TABLE certs (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            uid         BIGINT NOT NULL REFERENCES users(id),
            known       BIGINT REFERENCES certs_known(id),
            name        TEXT NOT NULL,
            expiry      TIMESTAMP
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
