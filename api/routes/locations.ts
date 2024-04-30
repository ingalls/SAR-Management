import { union } from 'drizzle-orm/pg-core'
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Config from '../lib/config.js';
import * as schemas from './schema.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/location', {
        name: 'List Locations',
        group: 'Locations',
        description: 'Return a combined list of mission/training locations to populate the location search box',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Application)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: 'res.ListLocations.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');
            await Auth.is_iam(config, req, 'Training:View');

            //count: sql<string>`count(*) OVER()`.as('count'),
            const pgres = await union(
                config.pool
                    .select({
                        location: Training.location,
                        location_geom: Training.location_geom
                    })
                    .from(schemas.Training),
                config.pool
                    .select({
                        location: Mission.location,
                        location_geom: Mission.location_geom
                    })
                    .from(schemas.Mission),
            )
                .where(query.where)
                .orderBy(orderBy)
                .limit(query.limit || 10)
                .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => {
                    delete t.count;
                    return t as Static<typeof AugmentedEquipment>
                })
            };
        }

            res.json(await Location.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
