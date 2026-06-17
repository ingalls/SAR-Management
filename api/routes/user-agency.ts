import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/user/:userid/agency', {
        name: 'List User Agencies',
        group: 'UserAgency',
        description: 'Get all agencies for a user',
        params: Type.Object({
            userid: Type.Integer()
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(Type.Object({
                uid: Type.Integer(),
                agency_id: Type.Integer(),
                access: Type.String(),
                agency_name: Type.Union([Type.String(), Type.Null()])
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const result = await config.models.UserAgency.listByUser(req.params.userid);

            res.json(result);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/user/:userid/agency', {
        name: 'Add User to Agency',
        group: 'UserAgency',
        description: 'Associate a user with an agency',
        params: Type.Object({
            userid: Type.Integer()
        }),
        body: Type.Object({
            agency_id: Type.Integer(),
            access: Type.String({ enum: ['user', 'admin'] })
        }),
        res: Type.Object({
            uid: Type.Integer(),
            agency_id: Type.Integer(),
            access: Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const result = await config.models.UserAgency.addAssociation(
                req.params.userid,
                req.body.agency_id,
                req.body.access
            );

            res.json(result);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/user/:userid/agency/:agencyid', {
        name: 'Update User Agency Access',
        group: 'UserAgency',
        description: 'Update a user\'s access level in an agency',
        params: Type.Object({
            userid: Type.Integer(),
            agencyid: Type.Integer()
        }),
        body: Type.Object({
            access: Type.String({ enum: ['user', 'admin'] })
        }),
        res: Type.Object({
            uid: Type.Integer(),
            agency_id: Type.Integer(),
            access: Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const result = await config.models.UserAgency.updateAccess(
                req.params.userid,
                req.params.agencyid,
                req.body.access
            );

            res.json(result);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/user/:userid/agency/:agencyid', {
        name: 'Remove User from Agency',
        group: 'UserAgency',
        description: 'Remove a user\'s association with an agency',
        params: Type.Object({
            userid: Type.Integer(),
            agencyid: Type.Integer()
        }),
        res: Type.Object({
            status: Type.Integer(),
            message: Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            await config.models.UserAgency.removeAssociation(
                req.params.userid,
                req.params.agencyid
            );

            res.json({
                status: 200,
                message: 'User removed from agency'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
