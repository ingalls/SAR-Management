function up(knex) {
    return knex.schema.raw(`
        INSERT INTO server (key, value, public)
            VALUES (
                'application',
                '${JSON.stringify({
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        name: {
                            type: "string",
                            description: 'The applicants legal name',
                            required: true
                        },
                        phone: {
                            type: "string",
                            description: 'The applicants phone',
                            required: true
                        },
                        email: {
                            type: "string",
                            description: 'The applicants email',
                            required: true
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
