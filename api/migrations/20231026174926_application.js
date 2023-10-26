function up(knex) {
    return knex.schema.raw(`
        INSERT INTO server (key, value, public)
            VALUES (
                'application',
                '${JSON.stringify({
                    type: "object",
                    additionalProperties: false,
                    required: ["name", "phone", "email"],
                    properties: {
                        name: {
                            type: "string",
                            description: 'The applicants legal name',
                        },
                        phone: {
                            type: "string",
                            description: 'The applicants phone',
                        },
                        email: {
                            type: "string",
                            description: 'The applicants email',
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
