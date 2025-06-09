import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, LeadershipResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/leadership', {
        name: 'List Leadership',
        group: 'Leadership',
        description: 'Get all team leaders',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(LeadershipResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Leadership, PermissionsLevel.View);

            const list = await config.models.Leadership.augmented_list();

            res.json(list)
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/leadership', {
        name: 'Create Leadership',
        group: 'Leadership',
        description: 'Create a new leader',
        body: Type.Object({
            uid: Type.Integer(),
            position: Type.String()
        }),
        res: LeadershipResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Leadership, PermissionsLevel.Admin);

            const leader = await config.models.Leadership.generate(req.body);
            res.json(await config.models.Leadership.augmented_from(leader.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/leadership/:leaderid', {
        name: 'Patch Leadership',
        group: 'Leadership',
        description: 'Update a leader',
        params: Type.Object({
            leaderid: Type.Integer(),
        }),
        body: Type.Object({
            uid: Type.Optional(Type.Integer()),
            position: Type.Optional(Type.String())
        }),
        res: LeadershipResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Leadership, PermissionsLevel.Admin);

            const leader = await config.models.Leadership.commit(req.params.leaderid, req.body);
            res.json(await config.models.Leadership.augmented_from(leader.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/leadership/:leaderid', {
        name: 'Delete Leadership',
        group: 'Leadership',
        description: 'delete a leader',
        params: Type.Object({
            leaderid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Leadership, PermissionsLevel.Admin);

            await config.models.Leadership.delete(req.params.leaderid);
            res.json({
                status: 200,
                message: 'Leader Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
