import Err from '@openaddresses/batch-error';
import MissionAssigned from '../lib/types/mission-assigned.js';
import Mission from '../lib/types/mission.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/mission/:missionid/assigned', {
        name: 'Get Assigned',
        group: 'MissionAssigned',
        auth: 'user',
        ':missionid': 'integer',
        description: 'Get users assigned to an mission',
        res: 'res.ListMissionAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:View');

            res.json(await MissionAssigned.list(config.pool, req.params.missionid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission/:missionid/assigned', {
        name: 'Add Assigned',
        group: 'MissionAssigned',
        auth: 'user',
        ':missionid': 'integer',
        description: 'Remove an assignment',
        body: 'req.body.CreateMissionAssigned.json',
        res: 'missions_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:Manage');

            res.json(await MissionAssigned.generate(config.pool, {
                mission_id: req.params.missionid,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'MissionAssigned',
        auth: 'user',
        ':missionid': 'integer',
        ':assignedid': 'integer',
        description: 'Remove a user from an mission',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Mission:Manage');

            const mission = await Mission.from(config.pool, req.params.missionid);
            const assigned = await MissionAssigned.from(config.pool, req.params.assignedid);
            if (assigned.mission_id !== mission.id) throw new Error(400, null, 'Assigned User does not belong to the Mission');

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
