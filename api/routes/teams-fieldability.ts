import { Type } from '@sinclair/typebox';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { FieldabilityResponse } from '../lib/types.js';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import { sql } from 'drizzle-orm';
import { Fieldability } from '../lib/schema.js';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/team/:teamid/fieldability', {
        name: 'List Fieldability',
        group: 'Teams',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Return fieldability settings for a team',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'id', enum: Object.keys(Fieldability)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(FieldabilityResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:View');

            res.json(await config.models.Fieldability.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                    AND team = ${req.params.teamid}
                `
            }))
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
