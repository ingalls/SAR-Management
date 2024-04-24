import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import { sql } from 'drizzle-orm';
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

            res.json(await config.models.MissionAssigned.augmented_list({
                where: sql`mission_id = ${req.params.missionid}`
            }))
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
        description: 'Create an assignment',
        body: Type.Object({
            uid: Type.Integer(),
            confirmed: Type.Boolean({ default: true }),
            role: Type.String({ default: 'Present' })
        }),
        res: MissionAssignedResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const assigned = await config.models.MissionAssigned.generate({
                mission_id: req.params.missionid,
                ...req.body
            });

            return res.json(config.models.MissionAssigned.augmented_from(assigned.id))
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
        body: Type.Object({
            confirmed: Type.Boolean(),
            role: Type.String()
        }),
        res: MissionAssignedResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Manage');

            const mission = await config.models.Mission.from(req.params.missionid);
            const assigned = await config.models.MissionAssigned.from(req.params.assignedid);
            if (assigned.mission_id !== mission.id) throw new Err(400, null, 'Assigned User does not belong to the Mission');

            await config.models.MissionAssigned.commit(req.params.assignedid, req.body);

            return res.json(config.models.MissionAssigned.augmented_from(assigned.id))
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

            const mission = await config.models.Mission.from(req.params.missionid);
            const assigned = await config.models.MissionAssigned.from(req.params.assignedid);
            if (assigned.mission_id !== mission.id) throw new Err(400, null, 'Assigned User does not belong to the Mission');

            await config.models.MissionAssigned.delete(req.params.missionid);

            return res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
