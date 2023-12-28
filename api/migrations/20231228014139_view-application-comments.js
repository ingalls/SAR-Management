function up(knex) {
    return knex.schema.raw(`
        CREATE VIEW view_application_comments AS
            SELECT
                application_comments.*,
                json_build_object(
                    'id', users.id,
                    'fname', users.fname,
                    'lname', users.lname
                ) AS user
            FROM
                application_comments
                    LEFT JOIN users
                        ON application_comments.author = users.id;

    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
