function up(knex) {
    return knex.schema.raw(`
        DROP VIEW view_issues;
        DROP VIEW view_issues_comments;

        ALTER TABLE users
            DROP COLUMN profile_id;

        CREATE VIEW view_issues AS
            SELECT
                count(*) OVER() AS count,
                issues.*,
                json_build_object(
                    'id', users.id,
                    'fname', users.fname,
                    'lname', users.lname
                ) AS user
            FROM
                issues
                    LEFT JOIN users
                        ON issues.author = users.id;
        CREATE VIEW view_issues_comments AS
            SELECT
                count(*) OVER() AS count,
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
