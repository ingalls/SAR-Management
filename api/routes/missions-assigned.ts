import Err from '@openaddresses/batch-error';
import MissionAssigned from '../lib/types/mission-assigned.js';
import Mission from '../lib/types/mission.js';
import Auth from '../lib/auth.js';
import { Type } from '@sinclair/typebox';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, MissionAssignedResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission/:missionid/assigned', {
        name: 'Get Assigned',
        group: 'MissionAssigned',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        description: 'Get users assigned to an mission',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionAssignedResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await MissionAssigned.list(config.pool, req.params.missionid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission/:missionid/assigned', {
        name: 'Add Assigned',
        group: 'MissionAssigned',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        description: 'Remove an assignment',
        body: 'req.body.CreateMissionAssigned.json',
        res: 'missions_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            res.json(await MissionAssigned.generate(config.pool, {
                mission_id: req.params.missionid,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission/:missionid/assigned/:assignedid', {
        name: 'Update Assigned',
        group: 'MissionAssigned',
        params: Type.Object({
            missionid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Update a user in a mission',
        body: 'req.body.PatchMissionAssigned.json',
        res: 'missions_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const mission = await Mission.from(config.pool, req.params.missionid);
            const assigned = await MissionAssigned.from(config.pool, req.params.assignedid);
            if (assigned.mission_id !== mission.id) throw new Err(400, null, 'Assigned User does not belong to the Mission');

            await assigned.commit(req.body);

            return res.json(assigned);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'MissionAssigned',
        params: Type.Object({
            missionid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Remove a user from an mission',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const mission = await Mission.from(config.pool, req.params.missionid);
            const assigned = await MissionAssigned.from(config.pool, req.params.assignedid);
            if (assigned.mission_id !== mission.id) throw new Err(400, null, 'Assigned User does not belong to the Mission');

            await assigned.delete();

            return res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
