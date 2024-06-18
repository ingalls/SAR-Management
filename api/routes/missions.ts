import Err from '@openaddresses/batch-error';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { Type } from '@sinclair/typebox';
import { Mission } from '../lib/schema.js';
import { sql } from 'drizzle-orm';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, MissionResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission', {
        name: 'List Missions',
        group: 'Mission',
        description: 'Get all missions for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            start: Type.Optional(Type.String()),
            end: Type.Optional(Type.String()),
            assigned: Type.Optional(Type.Integer()),
            team: Type.Optional(Type.Integer()),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Mission)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await config.models.Mission.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    (${req.query.filter}::TEXT IS NULL OR title ~* ${req.query.filter})
                    AND (${Param(req.query.assigned)}::INT IS NULL OR users @> ARRAY[${Param(req.query.assigned)}::INT])
                    AND (${Param(req.query.team)}::INT IS NULL OR teams_id @> ARRAY[${Param(req.query.team)}::INT])
                    AND (${Param(req.query.start)}::TIMESTAMP IS NULL OR start_ts >= ${Param(req.query.start)}::TIMESTAMP)
                    AND (${Param(req.query.end)}::TIMESTAMP IS NULL OR end_ts <= ${Param(req.query.end)}::TIMESTAMP)
                `
            }))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid', {
        name: 'Get Mission',
        group: 'Mission',
        description: 'Get a single mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            const mission = await config.models.Mission.augmented_from(req.params.missionid);
            if (!mission.users) mission.users = [];
            return res.json(mission);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission', {
        name: 'Create Mission',
        group: 'Mission',
        description: 'Create a new mission',
        body: Type.Object({
            title: Type.String(),
            externalid: Type.Optional(Type.String()),
            body: Type.String(),
            start_ts: Type.String(),
            end_ts: Type.String(),
            location: Type.String(),
            location_geom: Type.Optional(Type.Any()),
            assigned: Type.Optional(Type.Array(Type.Object({
                role: Type.String(),
                confirmed: Type.Boolean(),
                uid: Type.Integer()
            }))),
            teams: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, 'Mission:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;

            const mission = await config.models.Mission.generate({
                ...req.body,
                author: user.id
            });

            if (assigned) {
                for (const a of assigned) {
                    await config.models.MissionAssigned.generate({
                        mission_id: mission.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: a.uid
                    });
                }
            }

            if (teams) {
                for (const a of teams) {
                    await config.models.MissionTeam.generate({
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(mission.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission/:missionid', {
        name: 'Update Mission',
        group: 'Mission',
        description: 'Update an existing mission',
        body: Type.Object({
            title: Type.Optional(Type.String()),
            externalid: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            start_ts: Type.Optional(Type.String()),
            end_ts: Type.Optional(Type.String()),
            location: Type.Optional(Type.String()),
            location_geom: Type.Optional(Type.Any()),
            teams: Type.Optional(Type.Array(Type.Integer()))
        }),
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const teams = req.body.teams;
            delete req.body.teams;

            const mission = await config.models.Mission.commit(req.params.missionid, req.body);

            if (teams) {
                await config.models.MissionTeam.delete(sql`mission_id = ${mission.id}`)

                for (const a of teams) {
                    await config.models.MissionTeam.generate({
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(req.params.missionid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid', {
        name: 'Delete Mission',
        group: 'Mission',
        description: 'Remove an existing mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            await config.models.Mission.delete(req.params.missionid);

            return res.json({
                status: 200,
                message: 'Mission Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
