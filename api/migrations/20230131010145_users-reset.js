function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE users_reset (
            uid          BIGINT REFERENCES users(id),
            expires     TIMESTAMP NOT NULL,
            token       TEXT NOT NULL,
            action      TEXT NOT NULL
        );

        COMMENT ON TABLE users_reset IS 'Internal table for User reset tokens';
        COMMENT ON COLUMN users_reset.uid IS 'User ID that the reset belongs to';
        COMMENT ON COLUMN users_reset.expires IS 'Timestamp at which the reset expires';
        COMMENT ON COLUMN users_reset.token IS 'User Reset Token';
        COMMENT ON COLUMN users_reset.action IS 'Type of reset';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
