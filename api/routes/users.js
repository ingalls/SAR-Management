import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import Auth from '../lib/auth.js';
import bcrypt from 'bcrypt';
import Email from '../lib/email.js';

export default async function router(schema, config) {
    const email = new Email(config);

    await schema.get('/user', {
        name: 'Get Users',
        group: 'User',
        auth: 'user',
        description: 'Get all users on the server',
        req: 'req.query.ListUsers.json',
        res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Users:Read');

            res.json(await User.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user', {
        name: 'Create User',
        group: 'User',
        auth: 'admin',
        description: 'Create a new user',
        body: 'req.body.CreateUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Users:Admin');

            req.body.email = req.body.emailtoLowerCase();
            req.body.username = req.body.username.toLowerCase();
            const user = await User.generate(config.pool, {
                ...req.body,
                password: await bcrypt.hash(req.body.password || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)), 10)
            });

            if (config.email) {
                await email.newuser(user);
            }

            return res.json(user);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/user/:userid', {
        name: 'Patch User',
        group: 'User',
        auth: 'admin',
        description: 'Update an existing user',
        ':userid': 'integer',
        body: 'req.body.PatchUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await Auth.is_own_or_iam(req, req.params.userid, 'Users:Admin');

            // Non-Admins can't upgrade their own accounts
            if (req.auth.access !== 'admin') delete req.body.access;

            res.json(await User.commit(config.pool, req.params.userid, req.body));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/user/:userid', {
        name: 'Create User',
        group: 'User',
        auth: 'user',
        ':userid': 'integer',
        description: 'Return a user',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Users:View');

            res.json(await User.from(config.pool, req.params.userid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
