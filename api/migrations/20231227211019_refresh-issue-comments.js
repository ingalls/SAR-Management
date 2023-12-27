function up(knex) {
    return knex.schema.raw(`
        DROP VIEW view_issues_comments;

        CREATE VIEW view_issues_comments AS
            SELECT
                issues_comments.*,
                json_build_object(
                    'id', users.id,
                    'fname', users.fname,
                    'lname', users.lname
                ) AS user
            FROM
                issues_comments
                    LEFT JOIN users
                        ON issues_comments.author = users.id;

    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
