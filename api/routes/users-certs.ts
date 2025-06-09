import Err from '@openaddresses/batch-error';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import Spaces from '../lib/aws/spaces.js';
import { Type } from '@sinclair/typebox';
import { StandardResponse, CertResponse } from '../lib/types.js';
import { Cert } from '../lib/schema.js';

export default async function router(schema: Schema, config: Config) {
    const spaces = new Spaces();

    await schema.get('/user/:userid/cert', {
        name: 'Get Certs',
        group: 'Cert',
        description: 'Get all certs for the given user',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Cert)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(CertResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.User, PermissionsLevel.VIEW);

            res.json(await config.models.Cert.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    uid = ${req.params.userid}
                    AND name ~* ${req.query.filter}
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/user/:userid/cert/:certid', {
        name: 'Get Cert',
        group: 'Cert',
        description: 'Get a cert for the given user',
        params: Type.Object({
            userid: Type.Integer(),
            certid: Type.Integer()
        }),
        res: CertResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.User, PermissionsLevel.VIEW);

            const cert = await config.models.Cert.from(req.params.certid);
            if (cert.uid !== req.params.userid) throw new Err(400, null, 'Mismatch between UserID and Cert');

            res.json(cert);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/user/:userid/cert/:certid', {
        name: 'Delete Cert',
        group: 'Cert',
        description: 'Delete a cert for the given user',
        params: Type.Object({
            userid: Type.Integer(),
            certid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_own_or_iam(config, req, req.params.userid, IamGroup.User, PermissionsLevel.MANAGE);

            const cert = await config.models.Cert.from(req.params.certid);
            if (cert.uid !== req.params.userid) throw new Err(400, null, 'Mismatch between UserID and Cert');

            const asset = await config.models.Asset.from(cert.asset);

            await spaces.delete({
                Key: `assets/${asset.id}-${asset.name}`
            });

            config.models.Cert.delete(req.params.certid)

            res.json({
                status: 200,
                message: 'Asset Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/user/:userid/cert', {
        name: 'Create Certs',
        group: 'Cert',
        description: 'Create a new Certificate',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.String(),
            asset: Type.Integer(),
            known: Type.Optional(Type.Integer()),
            expiry: Type.Optional(Type.String({
                format: 'date'
            }))
        }),
        res: CertResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_own_or_iam(config, req, req.params.userid, IamGroup.User, PermissionsLevel.MANAGE);

            const cert = await config.models.Cert.generate({
                uid: user.id,
                ...req.body
            });

            res.json(cert);
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
