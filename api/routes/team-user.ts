import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import Auth from '../lib/auth.js';
import VCard from 'vcard-creator';
import { stringify } from 'csv-stringify/sync';
import { phone } from 'phone';
import { User } from '../lib/schema.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, UserResponse } from '../lib/types.js';
import { userFormat } from './users.js';

export default async function router(schema: Schema, config: Config) {
    const fields = new Set(Object.keys(User))
    fields.delete('password');

    await schema.get('/team/:teamid/user', {
        name: 'List Users',
        group: 'TeamUsers',
        description: 'Get all users that are part of a given team',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        query: Type.Object({
            format: Type.String({ enum: [ "csv", "json", "vcard" ], default: 'json' }),
            fields: Type.Optional(Type.Array(Type.String({ enum: Array.from(fields) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(User)})),
            filter: Type.Optional(Type.String({ default: '' })),
            disabled: Type.Optional(Type.Boolean({ default: false }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(UserResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:View');

            if (['vcard', 'csv'].includes(req.query.format)) {
                if (req.query.format === 'vcard') {
                    res.set('Content-Type', 'text/x-vcard');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.vcf"');
                } else if (req.query.format === 'csv') {
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', 'attachment; filename="sar-users.csv"');
                    res.write(stringify([req.query.fields]));
                }

                let total: number;
                let page = 0;
                do {
                    const list = await config.models.User.augmented_list({
                        page: page,
                        limit: 100,
                        where: sql`
                            teams_id @> ARRAY[${req.params.teamid}::INT]
                            AND (${Param(req.query.filter)}::TEXT IS NULL OR fname||' '||lname ~* ${Param(req.query.filter)})
                            AND (${Param(req.query.disabled)}::BOOLEAN IS NULL OR users.disabled = ${Param(req.query.disabled)})
                        `
                    })

                    total = list.total;

                    for (const user of list.items) {
                        if (req.query.format === 'vcard') {
                            // @ts-expect-error Old School import problems
                            const card = new VCard.default();
                            card.addName(user.lname, user.fname);
                            card.addCompany('MesaSAR');
                            card.addEmail(user.email);
                            card.addPhoneNumber(phone(user.phone).phoneNumber);
                            res.write(card.toString());
                        } else if (req.query.format === 'csv') {
                            const line = [];
                            for (const field of (req.query.fields || [])) {
                                // @ts-expect-error Investigate
                                line.push(user[field] === undefined ? '' : user[field]);
                            }
                            res.write(stringify([line]));
                        }
                    }

                    page++
                } while (total > (page + 1) * 100);

                res.end();
            } else {
                const list = await config.models.User.augmented_list({
                    limit: req.query.limit,
                    page: req.query.page,
                    order: req.query.order,
                    sort: req.query.sort,
                    where: sql`
                        teams_id @> ARRAY[${req.params.teamid}::INT]
                        AND (${Param(req.query.filter)}::TEXT IS NULL OR fname||' '||lname ~* ${Param(req.query.filter)})
                        AND (${Param(req.query.disabled)}::BOOLEAN IS NULL OR users.disabled = ${Param(req.query.disabled)})
                    `
                });

                list.items.map(userFormat)

                res.json(list);
            }
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/team/:teamid/user', {
        name: 'Add User',
        group: 'TeamUsers',
        description: 'Add a user to a team',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        body: Type.Object({
            uid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:Manage');

            await config.models.UserTeam.generate({
                uid: req.body.uid,
                tid: req.params.teamid
            })

             res.json({
                status: 200,
                message: 'User Added'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/team/:teamid/user/:userid', {
        name: 'Remove User',
        group: 'TeamUsers',
        description: 'Remove a user from a team',
        params: Type.Object({
            teamid: Type.Integer(),
            userid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Team:Manage');

            await config.models.UserTeam.delete(sql`
                tid = ${req.params.teamid}
                AND uid = ${req.params.userid}
            `);

             res.json({
                status: 200,
                message: 'User Removed'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
