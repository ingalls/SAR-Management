function up(knex) {
    return knex.schema.raw(`
        DROP VIEW view_equipment;
        DROP VIEW view_locations;
        DROP VIEW view_issues_comments;
        DROP VIEW view_issues;
        DROP VIEW view_teams;
        DROP VIEW leaders_view;

        ALTER TABLE assets
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE assets
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE certs
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE certs
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE equipment
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE equipment
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE equipment_types
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE equipment_types
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE issues
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE issues
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE issues_comments
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE issues_comments
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE missions
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE missions
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE notifications
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE notifications
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE teams
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE teams
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE training
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE training
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        ALTER TABLE users
            ALTER COLUMN created TYPE timestamptz
                USING created::timestamptz;
        ALTER TABLE users
            ALTER COLUMN updated TYPE timestamptz
                USING updated::timestamptz;
        CREATE VIEW view_equipment AS
            SELECT
                equipment.*,
                COALESCE(u.assigned, '[]'::JSON) AS assigned
            FROM
                equipment
                    LEFT JOIN (
                        SELECT
                            equip_id,
                            JSON_AGG(Json_Build_Object(
                                'id', users.id,
                                'fname', users.fname,
                                'lname', users.lname
                            )) AS assigned
                        FROM
                            equipment_assigned
                                LEFT JOIN users
                                    ON equipment_assigned.uid = users.id
                        GROUP BY
                            equipment_assigned.equip_id
                    ) u ON equipment.id = u.equip_id;

        CREATE VIEW view_locations AS
            SELECT
                loc_idx,
                location,
                location_geom
            FROM (
                    (
                        SELECT
                            location,
                            LOWER(location) AS loc_idx,
                            location_geom
                        FROM
                            missions
                        WHERE
                            location_geom IS NOT NULL
                            AND Length(Trim(location)) > 0
                    ) UNION (
                        SELECT
                            location,
                            LOWER(location) AS loc_idx,
                            location_geom
                        FROM
                            training
                        WHERE
                            location_geom IS NOT NULL
                            AND Length(Trim(location)) > 0
                    )
                ) m;

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

        CREATE VIEW leaders_view AS
            SELECT
                leadership.*,
                users.fname || ' ' || users.lname AS name
            FROM
                leadership
                    LEFT JOIN users
                        ON leadership.uid = users.id;

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
