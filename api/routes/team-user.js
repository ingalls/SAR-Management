import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import TeamUser from '../lib/types/team-user.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/team/:teamid/user', {
        name: 'List Users',
        group: 'TeamUsers',
        auth: 'user',
        description: 'Get all users that are part of a given team',
        ':teamid': 'integer',
        req: 'req.query.ListTeamUsers.json',
        res: 'res.ListTeamUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.team = req.params.teamid;
            const list = await User.list(config.pool, req.query);

            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/team/:teamid/user/:userid', {
        name: 'Remove User',
        group: 'TeamUsers',
        auth: 'user',
        description: 'Remove a user from a team',
        ':teamid': 'integer',
        ':userid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            await TeamUser.remove(config.pool, req.params.teamid, req.params.userid);

            return res.json({
                status: 200,
                message: 'User Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
