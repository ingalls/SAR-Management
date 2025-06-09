import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Team } from '../lib/schema.js';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import Auth, { Permissions, PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, TeamResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/iam', {
        name: 'Get IAM',
        group: 'IAM',
        description: 'Get all teams on the server',
        res: Type.Any()
    }, async (req, res) => {
        try {
            res.json(Permissions);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/team', {
        name: 'Get Teams',
        group: 'Teams',
        description: 'Get all teams on the server',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Team)})),
            filter: Type.Optional(Type.String({ default: '' })),
            fieldable: Type.Optional(Type.Boolean()),
            userid: Type.Optional(Type.Integer())
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(TeamResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Team, PermissionsLevel.VIEW);

            const list = await config.models.Team.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                    AND (${Param(req.query.userid)}::INT IS NULL OR users @> ARRAY[${Param(req.query.userid)}::INT])
                    AND (${Param(req.query.fieldable)}::BOOLEAN IS NULL OR fieldable = ${Param(req.query.fieldable)}::BOOLEAN)
                `
            });

            res.json(list)
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/team', {
        name: 'Create Team',
        group: 'Teams',
        description: 'Create a new team',
        body: Type.Object({
            name: Type.String(),
            body: Type.String(),
            public: Type.Optional(Type.Boolean()),
            colour_bg: Type.Optional(Type.String()),
            colour_txt: Type.Optional(Type.String()),
            fieldable: Type.Optional(Type.Boolean())
        }),
        res: TeamResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Team, PermissionsLevel.MANAGE);

            const team = await config.models.Team.generate(req.body);
            res.json(await config.models.Team.augmented_from(team.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/team/:teamid', {
        name: 'Get Team',
        group: 'Teams',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Return a team',
        res: TeamResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Team, PermissionsLevel.VIEW);

            res.json(await config.models.Team.augmented_from(req.params.teamid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/team/:teamid', {
        name: 'Update Team',
        group: 'Teams',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Update a team',
        body: Type.Object({
            name: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            iam: Type.Optional(Type.Any()),
            public: Type.Optional(Type.Boolean()),
            colour_bg: Type.Optional(Type.String()),
            colour_txt: Type.Optional(Type.String()),
            fieldable: Type.Optional(Type.Boolean())
        }),
        res: TeamResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Team, PermissionsLevel.MANAGE);

            if (user.access !== 'admin') {
                delete req.body.iam;
            }

            const team = await config.models.Team.commit(req.params.teamid, req.body);

            res.json(await config.models.Team.augmented_from(team.id));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/team/:teamid', {
        name: 'Delete Team',
        group: 'Teams',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Delete a team',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Team, PermissionsLevel.ADMIN);

            await config.models.Team.delete(req.params.teamid);

            res.json({
                status: 200,
                message: 'Team Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
