import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { MissionRole } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { StandardResponse, MissionRoleResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission-role', {
        name: 'List Roles',
        group: 'MissionRole',
        description: 'Get all mission roles for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(MissionRole)})),
            filter: Type.Optional(Type.String({ default: '' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionRoleResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await config.models.MissionRole.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission-role/:roleid', {
        name: 'Get Role',
        group: 'MissionRole',
        description: 'Get a single mission role',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        res: MissionRoleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await config.models.MissionRole.from(req.params.roleid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission-role', {
        name: 'Create Role',
        group: 'MissionRole',
        description: 'Create a new mission role',
        body: Type.Object({
            name: Type.String()
        }),
        res: MissionRoleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const role = await config.models.MissionRole.generate(req.body);

            return res.json(role);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission-role/:roleid', {
        name: 'Update Role',
        group: 'MissionRole',
        description: 'Update an existing mission role',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String())
        }),
        res: MissionRoleResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const role = await config.models.MissionRole.commit(req.params.roleid, req.body);
            return res.json(role);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission-role/:roleid', {
        name: 'Delete Role',
        group: 'MissionRole',
        description: 'Remove an existing mission role',
        params: Type.Object({
            roleid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const role = await config.models.MissionRole.delete(req.params.roleid);

            return res.json({
                status: 200,
                message: 'Mission Role Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
