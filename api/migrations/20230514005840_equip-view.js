function up(knex) {
    return knex.schema.raw(`
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
                    ) u ON equipment.id = u.equip_id
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
