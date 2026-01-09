import Err from '@openaddresses/batch-error';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { Type } from '@sinclair/typebox';
import { Mission } from '../lib/schema.js';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, MissionResponse } from '../lib/types.js';
import { PartialAsset } from '../lib/models/Mission.js';

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
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

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
             Err.respond(err, res);
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
            teams: Type.Optional(Type.Array(Type.Integer())),
            tags: Type.Optional(Type.Array(Type.Integer())),
            assets: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;
            const tags = req.body.tags;
            delete req.body.tags;
            const assets = req.body.assets;
            delete req.body.assets;

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

            if (tags) {
                for (const a of tags) {
                    await config.models.MissionTagAssigned.generate({
                        mission_id: mission.id,
                        tag_id: a
                    });
                }
            }

            if (assets) {
                for (const a of assets) {
                    await config.models.MissionAsset.generate({
                        mission_id: mission.id,
                        asset_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(mission.id));
        } catch (err) {
             Err.respond(err, res);
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
            teams: Type.Optional(Type.Array(Type.Integer())),
            tags: Type.Optional(Type.Array(Type.Integer())),
            assets: Type.Optional(Type.Array(Type.Integer()))
        }),
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: MissionResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            const teams = req.body.teams;
            delete req.body.teams;
            const tags = req.body.tags;
            delete req.body.tags;
            const assets = req.body.assets;
            delete req.body.assets;

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

            if (tags) {
                await config.models.MissionTagAssigned.delete(sql`mission_id = ${mission.id}`)

                for (const a of tags) {
                    await config.models.MissionTagAssigned.generate({
                        mission_id: mission.id,
                        tag_id: a
                    });
                }
            }

            if (assets) {
                await config.models.MissionAsset.delete(sql`mission_id = ${mission.id}`)

                for (const a of assets) {
                    if (!a) continue;
                    await config.models.MissionAsset.generate({
                        mission_id: mission.id,
                        asset_id: a
                    });
                }
            }

            res.json(await config.models.Mission.augmented_from(req.params.missionid));
        } catch (err) {
             Err.respond(err, res);
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
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.ADMIN);

            await config.models.MissionAssigned.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionTeam.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionTagAssigned.delete(sql`mission_id = ${req.params.missionid}`);
            await config.models.MissionAsset.delete(sql`mission_id = ${req.params.missionid}`);

            await config.models.Mission.delete(req.params.missionid);

            res.json({
                status: 200,
                message: 'Mission Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/mission/stats', {
        name: 'Mission Stats',
        group: 'Mission',
        description: 'Get mission statistics',
        res: Type.Object({
            year: Type.Record(Type.String(), Type.Integer()),
            month: Type.Record(Type.String(), Type.Integer())
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const stats = await config.models.Mission.pool.execute(sql`
                SELECT
                    EXTRACT(YEAR FROM start_ts) as year,
                    TO_CHAR(start_ts, 'YYYY-MM') as month,
                    COUNT(*) as count
                FROM missions
                GROUP BY 1, 2
            `);

            const response = {
                year: {} as Record<string, number>,
                month: {} as Record<string, number>
            };

            for (const row of stats) {
                const year = String(row.year);
                const month = String(row.month);
                const count = parseInt(String(row.count));

                if (!response.year[year]) response.year[year] = 0;
                response.year[year] += count;

                response.month[month] = count;
            }

            res.json(response);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid/assets', {
        name: 'Get Mission Assets',
        group: 'Mission',
        description: 'Get a single missions assets',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: Type.Object({
            assets: Type.Array(PartialAsset)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);
            res.json({
                assets: await config.models.Mission.assets(req.params.missionid)
            });
        } catch (err) {
             Err.respond(err, res);
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
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const mission = await config.models.Mission.augmented_from(req.params.missionid);
            if (!mission.users) mission.users = [];

            res.json(mission);
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
