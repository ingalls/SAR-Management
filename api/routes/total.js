import Err from '@openaddresses/batch-error';
import Total from '../lib/types/total.js';
import { Schema } from '@openaddresses/batch-generic';
import { stringify } from '../node_modules/csv-stringify/lib/sync.js';

export default async function router(schema, config) {
    await schema.get('/total', {
        name: 'Get Totals',
        group: 'Total',
        auth: 'public',
        description: 'Retrieve total users across time',
        res: 'res.ListTotal.json'
    }, async (req, res) => {
        try {
            const list = await Total.list(config.pool);
            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/total/export', {
        name: 'Export Totals',
        group: 'Total',
        auth: 'public',
        description: 'Export total users across time to a CSV',
        query: 'req.query.ExportTotal.json'
    }, async (req, res) => {
        try {
            const cols = Object.keys(Schema.from(config.pool, Total).properties);

            res.header('Content-Disposition', `attachment; filename="tak-total-users.${req.query.format}"`);
            if (req.query.format === 'csv') {
                res.header('Content-Type', 'text/csv');
                res.write(stringify([cols]));
            } else {
                res.header('Content-Type', 'application/ld+json');
            }

            (await Total.stream(config.pool, {
                order: req.query.order,
                sort: req.query.sort
            })).on('data', async (total) => {
                total = total.serialize();

                if (req.query.format === 'jsonld') {
                    res.write(JSON.stringify(total) + '\n');
                } else {
                    const arr = [];
                    for (const key of cols) arr.push(total[key]);
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
