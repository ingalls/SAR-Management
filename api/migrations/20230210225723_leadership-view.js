function up(knex) {
    return knex.schema.raw(`
        CREATE VIEW leaders_view AS
            SELECT
                leadership.*,
                users.fname || ' ' || users.lname AS name
            FROM
                leadership
                    LEFT JOIN users
                        ON leadership.uid = users.id;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
