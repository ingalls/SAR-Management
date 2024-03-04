import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import TeamUser from '../lib/types/team-user.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/team/:teamid/user', {
        name: 'List Users',
        group: 'TeamUsers',
        auth: 'user',
        description: 'Get all users that are part of a given team',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        query: 'req.query.ListTeamUsers.json',
        res: 'res.ListTeamUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Team:View');

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
        params: Type.Object({
            teamid: Type.Integer(),
            userid: Type.Integer()
        }),
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Team:Manage');

            await TeamUser.remove(config.pool, req.params.teamid, req.params.userid);

            return res.json({
                status: 200,
                message: 'User Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/team/:teamid/user', {
        name: 'Add User',
        group: 'TeamUsers',
        auth: 'user',
        description: 'Add a user to a team',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        body: 'req.body.AddUID.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Team:Manage');

            await TeamUser.generate(config.pool, {
                tid: req.params.teamid,
                uid: req.body.uid
            });

            return res.json({
                status: 200,
                message: 'User Added'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
