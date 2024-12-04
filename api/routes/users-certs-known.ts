import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth from '../lib/auth.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';
import { CertKnownResponse } from '../lib/types.js'
import { CertKnown } from '../lib/schema.js';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/certs', {
        name: 'Get Certs',
        group: 'CertKnown',
        description: 'Get all known certs',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(CertKnown)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(CertKnownResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            res.json(await config.models.CertKnown.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
