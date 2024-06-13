import { union } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Config from '../lib/config.js';
import { Training, Mission } from '../lib/schema.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/location', {
        name: 'List Locations',
        group: 'Locations',
        description: 'Return a combined list of mission/training locations to populate the location search box',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Any()
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');
            await Auth.is_iam(config, req, 'Training:View');

            const pgres = await config.pool
                .select({
                    location: Training.location,
                    location_geom: Training.location_geom
                })
                .from(Training)
                .where(sql`name ~* ${req.query.filter}`)
                .union(
                    config.pool
                    .select({
                        location: Mission.location,
                        location_geom: Mission.location_geom
                    })
                    .from(Mission)
                    .where(sql`name ~* ${req.query.filter}`)
                )
                .limit(req.query.limit || 10)
                .offset((req.query.page || 0) * (req.query.limit || 10))

            if (pgres.length === 0) {
                return res.json({ total: 0, items: [] });
            } else {
                return res.json({
                    total: pgres.length,
                    items: pgres
                });
            }

        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
