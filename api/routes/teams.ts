import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Team from '../lib/types/team.js';
import TeamView from '../lib/views/team.js';
import Auth, { Permissions } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/iam', {
        name: 'Get IAM',
        group: 'IAM',
        description: 'Get all teams on the server',
        res: Type.Any()
    }, async (req, res) => {
        try {
            return res.json(Permissions);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/team', {
        name: 'Get Teams',
        group: 'Teams',
        description: 'Get all teams on the server',
        query: 'req.query.ListTeams.json',
        res: 'res.ListTeams.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:View');

            const list = await TeamView.list(config.pool, req.query);

            return res.json({
                total: list.total,
                teams: list.view_teams
            });
        } catch (err) {
            return Err.respond(err, res);
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
        res: 'res.Team.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:Manage');

            res.json(await config.models.Team.generate(req.body));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/team/:teamid', {
        name: 'Get Team',
        group: 'Teams',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Return a team',
        res: 'res.Team.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:View');

            res.json(await config.models.Team.from(req.params.teamid));
        } catch (err) {
            return Err.respond(err, res);
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
        res: 'res.Team.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:Manage');

            if (req.auth.access !== 'admin') {
                delete req.body.iam;
            }

            res.json(await config.models.Team.commit(req.params.teamid, req.body));
        } catch (err) {
            return Err.respond(err, res);
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
            await Auth.is_iam(config, req, 'Team:Admin');

            await config.models.Team.delete(req.params.teamid);

            return res.json({
                status: 200,
                message: 'Team Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
