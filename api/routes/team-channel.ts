import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { TeamChannelResponse, StandardResponse } from '../lib/types.js';
import Err from '@openaddresses/batch-error';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import Slack from '../lib/slack.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/team/:teamid/channel', {
        name: 'List Team Channels',
        group: 'TeamChannel',
        description: 'List all Team Channel mappings or filter by team',
        params: Type.Object({
            teamid: Type.Integer()
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String())
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(TeamChannelResponse),
            config: Type.Optional(Type.Object({
                'slack::usergroup::enabled': Type.Boolean(),
                'slack::usergroup::name': Type.String()
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const list = await config.models.TeamChannel.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`team_id = ${req.params.teamid}`
            });

            const settings = {
                'slack::usergroup::enabled': (await config.models.TeamSetting.typed(req.params.teamid, 'slack::usergroup::enabled', false)).value,
                'slack::usergroup::name': (await config.models.TeamSetting.typed(req.params.teamid, 'slack::usergroup::name', '')).value
            };

            res.json({
                ...list,
                config: settings
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.put('/team/:teamid/channel/settings', {
        name: 'Update Team Slack Settings',
        group: 'TeamChannel',
        description: 'Update Slack settings for a team',
        params: Type.Object({
            teamid: Type.Integer()
        }),
        body: Type.Object({
            'slack::usergroup::enabled': Type.Optional(Type.Boolean()),
            'slack::usergroup::name': Type.Optional(Type.String())
        }),
        res: Type.Object({
            'slack::usergroup::enabled': Type.Boolean(),
            'slack::usergroup::name': Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            if (req.body['slack::usergroup::enabled'] !== undefined) {
                await config.models.TeamSetting.update(req.params.teamid, 'slack::usergroup::enabled', String(req.body['slack::usergroup::enabled']));
            }

            if (req.body['slack::usergroup::name'] !== undefined) {
                await config.models.TeamSetting.update(req.params.teamid, 'slack::usergroup::name', req.body['slack::usergroup::name']);
            }

            res.json({
                'slack::usergroup::enabled': (await config.models.TeamSetting.typed(req.params.teamid, 'slack::usergroup::enabled', false)).value,
                'slack::usergroup::name': (await config.models.TeamSetting.typed(req.params.teamid, 'slack::usergroup::name', '')).value
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/team/:teamid/channel/sync', {
        name: 'Sync Team Channels',
        group: 'TeamChannel',
        description: 'Sync Slack users for a given team',
        params: Type.Object({
            teamid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const slack = await Slack.create(config);
            if (!slack) throw new Err(400, null, 'Slack is not configured');

            const sync = await slack.userGroupSync(req.params.teamid);

            if (sync.errors.length) {
                res.status(500).json({
                    status: 500,
                    message: sync.errors.join(', ')
                });
                return;
            }

            res.json({
                status: 200,
                message: sync.warnings.length
                    ? `Synced (warnings: ${sync.warnings.join('; ')})`
                    : 'Synced'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/team/:teamid/channel', {
        name: 'Create Team Channel',
        group: 'TeamChannel',
        description: 'Create a new Team Channel mapping',
        params: Type.Object({
            teamid: Type.Integer()
        }),
        body: Type.Object({
            channel_id: Type.String(),
            channel_name: Type.String()
        }),
        res: TeamChannelResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const created = await config.models.TeamChannel.generate({
                team_id: req.params.teamid,
                ...req.body
            });

            res.json(created);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/team/:teamid/channel/:id', {
        name: 'Delete Team Channel',
        group: 'TeamChannel',
        description: 'Delete a Team Channel mapping',
        params: Type.Object({
            teamid: Type.Integer(),
            id: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            await config.models.TeamChannel.delete(req.params.id);

            res.json({
                status: 200,
                message: 'Team Channel Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

}
