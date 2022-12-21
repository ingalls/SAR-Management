import Err from '@openaddresses/batch-error';
import Mission from '../lib/types/mission.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/mission', {
        name: 'List Missions',
        group: 'Mission',
        auth: 'user',
        description: 'Get all missions for the Org',
        req: 'req.query.ListMissions.json',
        res: 'res.ListMissions.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Mission.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission/:missionid', {
        name: 'Get Mission',
        group: 'Mission',
        auth: 'user',
        description: 'Get a single mission',
        ':missionid': 'integer',
        res: 'missions.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Mission.from(config.pool, req.params.missionid));
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
            await Auth.is_auth(req);

            res.json(await Mission.generate(config.pool, {
                author: req.auth.id,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
