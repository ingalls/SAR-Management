import Err from '@openaddresses/batch-error';
import Mission from '../lib/types/mission.js';
import MissionView from '../lib/views/mission.js';
import MissionTeam from '../lib/types/mission-team.js';
import MissionAssigned from '../lib/types/mission-assigned.js';
import Auth from '../lib/auth.js';
import moment from 'moment';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission', {
        name: 'List Missions',
        group: 'Mission',
        auth: 'user',
        description: 'Get all missions for the Org',
        query: 'req.query.ListMissions.json',
        res: 'res.ListMissions.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await MissionView.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid', {
        name: 'Get Mission',
        group: 'Mission',
        auth: 'user',
        description: 'Get a single mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: 'view_mission.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            const mission = await MissionView.from(config.pool, req.params.missionid);
            if (!mission.users) mission.users = [];
            return res.json(mission);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission', {
        name: 'Create Mission',
        group: 'Mission',
        auth: 'user',
        description: 'Create a new mission',
        body: 'req.body.CreateMission.json',
        res: 'missions.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const mission = await Mission.generate(config.pool, {
                ...req.body,
                author: req.auth.id
            });

            if (assigned) {
                for (const a of assigned) {
                    await MissionAssigned.generate(config.pool, {
                        mission_id: mission.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: a.uid
                    });
                }
            }

            if (teams) {
                for (const a of teams) {
                    await MissionTeam.generate(config.pool, {
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            return res.json(mission);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission/:missionid', {
        name: 'Update Mission',
        group: 'Mission',
        auth: 'user',
        description: 'Update an existing mission',
        body: 'req.body.PatchMission.json',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: 'missions.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const teams = req.body.teams;
            delete req.body.teams;

            const mission = await Mission.from(config.pool, req.params.missionid);
            await mission.commit(req.body);

            if (teams) {
                await MissionTeam.delete(config.pool, mission.id, {
                    column: 'mission_id'
                });

                for (const a of teams) {
                    await MissionTeam.generate(config.pool, {
                        mission_id: mission.id,
                        team_id: a
                    });
                }
            }

            return res.json(mission);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid', {
        name: 'Delete Mission',
        group: 'Mission',
        auth: 'user',
        description: 'Remove an existing mission',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const mission = await Mission.from(config.pool, req.params.missionid);
            await mission.delete();

            return res.json({
                status: 200,
                message: 'Mission Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
