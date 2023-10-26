function up(knex) {
    return knex.schema.raw(`
        INSERT INTO server (key, value, public)
            VALUES (
                'application',
                '${JSON.stringify({
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        name: { type: "string" },
                        phone: { type: "string" },
                        email: { type: "string" },
                        meta: {
                            type: "object",
                            properties: {}
                        }
                    }
                })}',
                True
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
