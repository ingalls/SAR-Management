import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import Auth from '../lib/auth.js';
import bcrypt from 'bcrypt';
import Email from '../lib/email.js';
import TeamUser from '../lib/types/team-user.js';
import { stringify } from '../node_modules/csv-stringify/lib/sync.js';
import VCard from 'vcard-creator';
import { phone } from 'phone';

export default async function router(schema, config) {
    const email = new Email(config);

    await schema.get('/user', {
        name: 'Get Users',
        group: 'User',
        auth: 'user',
        description: 'Get all users on the server',
        query: 'req.query.ListUsers.json',
        res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:View');

            if (['vcard', 'csv'].includes(req.query.format)) {
                if (req.query.format === 'vcard') {
                    res.set('Content-Type', 'text/x-vcard');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.vcf"');
                } else if (req.query.format === 'csv') {
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.csv"');
                    res.write(stringify([req.query.fields]));
                }

                (await User.stream(config.pool, req.query)).on('data', async (user) => {
                    if (req.query.format === 'vcard') {
                        const card = new VCard.default();
                        card.addName(user.lname, user.fname);
                        card.addCompany('MesaSAR');
                        card.addEmail(user.email);
                        card.addPhoneNumber(phone(user.phone).phoneNumber);
                        res.write(card.toString());
                    } else if (req.query.format === 'csv') {
                        const res = [];
                        for (const field of req.query.fields) {
                            res.push(user[field] === undefined ? '' || user[field]);
                        }
                        res.write(stringify([res]));
                    }
                }).on('end', () => {
                    res.end();
                });
            } else {
                res.json(await User.list(config.pool, req.query));
            }
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
            await Auth.is_iam(req, 'User:Admin');

            req.body.email = req.body.email.toLowerCase();
            req.body.username = req.body.username.toLowerCase();

            const teams = req.body.teams;
            delete req.body.teams;

            const user = await User.generate(config.pool, {
                ...req.body,
                password: await bcrypt.hash(req.body.password || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)), 10)
            });

            if (teams) {
                const uid = user.id;
                for (const tid of teams) {
                    await TeamUser.generate(config.pool, { tid, uid });
                }
            }

            if (config.email) await email.newuser(user);

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
            await Auth.is_iam(req, 'User:View');

            res.json(await User.from(config.pool, req.params.userid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/user/:userid', {
        name: 'Create User',
        group: 'User',
        auth: 'user',
        ':userid': 'integer',
        description: 'Return a user',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:Admin');

            const user = await User.from(config.pool, req.params.userid);

            if (config.email) await email.user_disabled(user);
            res.json(await user.commit({
                disabled: true
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
