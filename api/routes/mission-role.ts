import Err from '@openaddresses/batch-error';
import MissionRole from '../lib/types/mission-role.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission-role', {
        name: 'List Roles',
        group: 'MissionRole',
        auth: 'user',
        description: 'Get all mission roles for the Org',
        query: 'req.query.ListMissionRoles.json',
        res: 'res.ListMissionRoles.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:View');

            res.json(await MissionRole.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission-role/:roleid', {
        name: 'Get Role',
        group: 'MissionRole',
        auth: 'user',
        description: 'Get a single mission role',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        res: 'mission_role.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:View');

            res.json(await MissionRole.from(config.pool, req.params.roleid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission-role', {
        name: 'Create Role',
        group: 'MissionRole',
        auth: 'user',
        description: 'Create a new mission role',
        body: 'req.body.CreateMissionRole.json',
        res: 'mission_role.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:Admin');

            const role = await MissionRole.generate(config.pool, req.body);

            return res.json(role);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission-role/:roleid', {
        name: 'Update Role',
        group: 'MissionRole',
        auth: 'user',
        description: 'Update an existing mission role',
        body: 'req.body.PatchMissionRole.json',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        res: 'mission_role.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:Admin');

            const role = await MissionRole.from(config.pool, req.params.roleid);
            await role.commit(req.body);
            return res.json(role);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission-role/:roleid', {
        name: 'Delete Rolej',
        group: 'MissionRole',
        auth: 'user',
        description: 'Remove an existing mission role',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:Admin');

            const role = await MissionRole.from(config.pool, req.params.roleid);
            await role.delete();

            return res.json({
                status: 200,
                message: 'Mission Role Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
