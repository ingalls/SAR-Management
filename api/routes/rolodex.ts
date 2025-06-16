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

    await schema.get('/rolodex/:rolodexid', {
        name: 'Get Rolodex Item',
        group: 'Rolodex',
        description: 'Get a rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer(),
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.VIEW);

            const item = await config.models.Rolodex.from(req.params.rolodexid);

            res.json(item);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/rolodex', {
        name: 'Create Rolodex Item',
        group: 'Rolodex',
        description: 'Create a new rolodex item',
        body: Type.Object({
            name: Type.String(),
            remarks: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const item = await config.models.Rolodex.generate({
                ...req.body,
            });

            res.json(item);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/rolodex/:rolodexid', {
        name: 'Patch Rolodex',
        group: 'User',
        description: 'Update an existing rolodex item',
        params: Type.Object({
            rolodexid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String()),
            remarks: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
        }),
        res: RolodexResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_own_or_iam(config, req, req.params.userid, IamGroup.Rolodex, PermissionsLevel.MANAGE);

            const item = await config.models.Rolodex.commit(req.params.rolodexid, req.body);

            res.json(item);
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
