import Err from '@openaddresses/batch-error';
import { sql } from 'drizzle-orm';
import Auth from '../lib/auth.js';
import { User } from '../lib/schema.js';
import bcrypt from 'bcrypt';
import Email from '../lib/email.js';
import { stringify } from '../node_modules/csv-stringify/lib/sync.js';
import VCard from 'vcard-creator';
import { phone } from 'phone';
import Schema from '@openaddresses/batch-schema';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { UserResponse } from '../lib/types.js';
import { User_EmergencyContact } from '../lib/models/User.js';
import Config from '../lib/config.js';
import { Static, Type } from '@sinclair/typebox';

function format(u: Static<typeof UserResponse>): Static<typeof UserResponse> {
    if (u.phone) {
        const p = phone(u.phone);
        if (p.isValid && p.countryCode === '+1') {
            u.phone = `(${p.phoneNumber.slice(2, 5)}) ${p.phoneNumber.slice(5, 8)}-${p.phoneNumber.slice(8, 12)}`;
        }
    }

    return u;
}

export default async function router(schema: Schema, config: Config) {
    const email = new Email(config);

    await schema.get('/user', {
        name: 'Get Users',
        group: 'User',
        description: 'Get all users on the server',
        query: Type.Object({
            format: Type.Optional(Type.String({ enum: [ "csv", "json", "vcard" ] })),
            fields: Type.Optional(Type.String({ enum: Object.keys(User) })),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(User)})),
            filter: Type.Optional(Type.String({ default: '' })),
            disabled: Type.Optional(Type.Boolean({ default: false })),
            team: Type.Optional(Type.Integer({ description: 'Only show users part of a specific team' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(UserResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            if (['vcard', 'csv'].includes(req.query.format)) {
                if (req.query.format === 'vcard') {
                    res.set('Content-Type', 'text/x-vcard');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.vcf"');
                } else if (req.query.format === 'csv') {
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.csv"');
                    res.write(stringify([req.query.fields]));
                }
                (await config.models.User.stream({
                    where: sql`
                        (${Param(req.query.filter)}::TEXT IS NULL OR fname||' '||lname ~* ${Param(req.query.filter)})
                        AND (${Param(req.query.team)}::INT IS NULL OR teams_id @> ARRAY[${Param(req.query.team)}::INT])
                        AND (${Param(req.query.disabled)}::BOOLEAN IS NULL OR users.disabled = ${Param(req.query.disabled)})
                    `
                })).on('data', async (user) => {
                    if (req.query.format === 'vcard') {
                        const card = new VCard();
                        card.addName(user.lname, user.fname);
                        card.addCompany('MesaSAR');
                        card.addEmail(user.email);
                        card.addPhoneNumber(phone(user.phone).phoneNumber);
                        res.write(card.toString());
                    } else if (req.query.format === 'csv') {
                        const line = [];
                        for (const field of req.query.fields) {
                            line.push(user[field] === undefined ? '' : user[field]);
                        }
                        res.write(stringify([line]));
                    }
                }).on('end', () => {
                    res.end();
                });
            } else {
                const list = await config.models.User.augmented_list({
                    limit: req.query.limit,
                    page: req.query.page,
                    order: req.query.order,
                    sort: req.query.sort,
                    where: sql`
                        (${Param(req.query.filter)}::TEXT IS NULL OR fname||' '||lname ~* ${Param(req.query.filter)})
                        AND (${Param(req.query.team)}::INT IS NULL OR teams_id @> ARRAY[${Param(req.query.team)}::INT])
                        AND (${Param(req.query.disabled)}::BOOLEAN IS NULL OR users.disabled = ${Param(req.query.disabled)})
                    `
                });

                list.items.map(format)

                return res.json(list);
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user', {
        name: 'Create User',
        group: 'User',
        description: 'Create a new user',
        body: Type.Object({
            username: Type.String(),
            email: Type.String(),
            password: Type.Optional(Type.String()),
            phone: Type.String(),
            fname: Type.String(),
            lname: Type.String(),
            teams: Type.Optional(Type.Array(Type.Integer())),
            bday: Type.Optional(Type.String()),
            start_year: Type.Optional(Type.Integer()),
            emergency: Type.Optional(Type.Array(User_EmergencyContact)),
            address_street: Type.Optional(Type.String()),
            address_city: Type.Optional(Type.String()),
            address_state: Type.Optional(Type.String()),
            address_zip: Type.Optional(Type.String()),
        }),
        res: UserResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:Admin');

            req.body.email = req.body.email.toLowerCase();
            req.body.username = req.body.username.toLowerCase();

            const teams = req.body.teams;
            delete req.body.teams;

            const user = await config.models.User.generate({
                ...req.body,
                password: await bcrypt.hash(req.body.password || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)), 10)
            });

            if (teams) {
                const uid = user.id;
                for (const tid of teams) {
                    await config.models.UserTeam.generate({ tid, uid });
                }
            }

            if (config.email) await email.newuser(user);

            return res.json(format(await config.models.User.augmented_from(user.id)));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/user/:userid', {
        name: 'Patch User',
        group: 'User',
        description: 'Update an existing user',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        body: Type.Object({
            username: Type.Optional(Type.String()),
            access: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            fname: Type.Optional(Type.String()),
            lname: Type.Optional(Type.String()),
            teams: Type.Optional(Type.Array(Type.Integer())),
            bday: Type.Optional(Type.String()),
            start_year: Type.Optional(Type.Integer()),
            emergency: Type.Optional(Type.Array(User_EmergencyContact)),
            address_street: Type.Optional(Type.String()),
            address_city: Type.Optional(Type.String()),
            address_state: Type.Optional(Type.String()),
            address_zip: Type.Optional(Type.String()),
        }),
        res: UserResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_own_or_iam(config, req, req.params.userid, 'Users:Admin');

            // Non-Admins can't upgrade their own accounts
            if (user.access !== 'admin') delete req.body.access;

            await config.models.User.commit(req.params.userid, req.body);

            return res.json(format(await config.models.User.augmented_from(req.params.userid)));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/user/:userid', {
        name: 'Get User',
        group: 'User',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        description: 'Return a user',
        res: UserResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            return res.json(format(await config.models.User.augmented_from(req.params.userid)));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/user/:userid', {
        name: 'Delete User',
        group: 'User',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        description: 'Disable an existing user',
        res: UserResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:Admin');

            const user = await config.models.User.commit(req.params.userid, {
                disabled: true
            });

            if (config.email) await email.user_disabled(user);

            return res.json(await config.models.User.augmented_from(req.params.userid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
