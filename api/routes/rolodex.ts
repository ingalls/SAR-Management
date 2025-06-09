import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import { Rolodex } from '../lib/schema.js';
import { RolodexResponse } from '../lib/types.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Config from '../lib/config.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/rolodex', {
        name: 'Get Rolodex',
        group: 'Rolodex',
        description: 'Get all rolodex items',
        query: Type.Object({
            fields: Type.Optional(Type.Array(Type.String({ enum: Object.keys(Rolodex) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Rolodex)})),
            filter: Type.Optional(Type.String({ default: '' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(RolodexResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW);

            const list = await config.models.Rolodex.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    (name ~* ${req.query.filter} OR email ~* ${req.query.filter})
                    AND archived = False
                `
            });

            res.json(list);
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
