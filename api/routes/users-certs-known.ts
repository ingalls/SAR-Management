import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { eq, sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';
import { CertKnownResponse, StandardResponse } from '../lib/types.js';
import { Cert, CertKnown } from '../lib/schema.js';
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
            await Auth.is_iam(config, req, IamGroup.User, PermissionsLevel.VIEW);

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

    await schema.get('/certs/:certid', {
        name: 'Get Cert',
        group: 'CertKnown',
        description: 'Get a known cert by ID',
        params: Type.Object({
            certid: Type.Integer(),
        }),
        res: CertKnownResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.User, PermissionsLevel.VIEW);

            res.json(await config.models.CertKnown.from(req.params.certid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/certs', {
        name: 'Create Cert',
        group: 'CertKnown',
        description: 'Create a known cert',
        body: Type.Object({
            name: Type.String()
        }),
        res: CertKnownResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            res.json(await config.models.CertKnown.generate(req.body));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/certs/:certid', {
        name: 'Update Cert',
        group: 'CertKnown',
        description: 'Update a known cert',
        params: Type.Object({
            certid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String())
        }),
        res: CertKnownResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            res.json(await config.models.CertKnown.commit(req.params.certid, req.body));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/certs/:certid', {
        name: 'Delete Cert',
        group: 'CertKnown',
        description: 'Delete a known cert',
        params: Type.Object({
            certid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const usage = await config.pool
                .select({
                    total: sql<number>`count(*)::integer`
                })
                .from(Cert)
                .where(eq(Cert.known, req.params.certid));

            if (usage[0] && usage[0].total > 0) {
                throw new Err(400, null, 'Known cert is in use by existing certificate records');
            }

            await config.models.CertKnown.delete(req.params.certid);

            res.json({
                status: 200,
                message: 'Known Cert Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
