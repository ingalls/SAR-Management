function up(knex) {
    return knex.schema.raw(`
        DROP VIEW view_teams;

        CREATE VIEW view_teams AS
            SELECT
                teams.*,
                members.members
            FROM
                teams
                    LEFT JOIN (
                        SELECT
                            tid,
                            COUNT(uid) AS members
                        FROM
                            users_to_teams
                        GROUP BY
                           tid
                    ) members
                    ON teams.id = members.tid;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
