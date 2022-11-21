import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';

export default async function router(schema, config) {
    await schema.get('/user', {
        name: 'Get Users',
        group: 'User',
        auth: 'user',
        description: 'Get all users on the server',
        req: 'req.query.ListUsers.json',
        res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            res.json(await User.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue', {
        name: 'Create User',
        group: 'User',
        auth: 'admin',
        description: 'Create a new user',
        body: 'req.body.CreateUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            res.json(await User.generate(config.pool, req.body));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
