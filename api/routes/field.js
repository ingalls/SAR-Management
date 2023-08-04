import Err from '@openaddresses/batch-error';
import Field from '../lib/types/field.js';
import { Schema } from '@openaddresses/batch-generic';
import { stringify } from '../node_modules/csv-stringify/lib/sync.js';

export default async function router(schema, config) {
    await schema.get('/field', {
        name: 'Get Fields',
        group: 'Field',
        auth: 'public',
        description: 'Retrieve all fields for a given time range',
        res: 'res.ListField.json'
    }, async (req, res) => {
        try {
            const list = await Field.list(config.pool);
            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/field/export', {
        name: 'Export Fields',
        group: 'Field',
        auth: 'public',
        description: 'Export all fields for a given time range to a CSV',
        query: 'req.query.ExportField.json'
    }, async (req, res) => {
        try {
            const cols = Object.keys(Schema.from(config.pool, Field).properties);

            res.header('Content-Disposition', `attachment; filename="tak-fields.${req.query.format}"`);
            if (req.query.format === 'csv') {
                res.header('Content-Type', 'text/csv');
                res.write(stringify([cols]));
            } else {
                res.header('Content-Type', 'application/ld+json');
            }

            (await Field.stream(config.pool, {
                order: req.query.order,
                sort: req.query.sort
            })).on('data', async (field) => {
                field = field.serialize();

                if (req.query.format === 'jsonld') {
                    res.write(JSON.stringify(field) + '\n');
                } else {
                    const arr = [];
                    for (const key of cols) arr.push(field[key]);
                    res.write(stringify([arr]));
                }
            }).on('end', () => {
                res.end();
            });

        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
