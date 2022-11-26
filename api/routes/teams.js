import Err from '@openaddresses/batch-error';
import Team from '../lib/types/team.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/team', {
        name: 'Get Teams',
        group: 'Teams',
        auth: 'user',
        description: 'Get all teams on the server',
        req: 'req.query.ListTeams.json',
        res: 'res.ListTeams.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Team.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/team', {
        name: 'Create Team',
        group: 'Teams',
        auth: 'admin',
        description: 'Create a new team',
        body: 'req.body.CreateTeam.json',
        res: 'res.Team.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            res.json(await Team.generate(config.pool, req.body));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/team/:teamid', {
        name: 'Get User',
        group: 'Teams',
        auth: 'user',
        ':teamid': 'integer',
        description: 'Return a team',
        res: 'res.Team.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Team.from(config.pool, req.params.teamid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
