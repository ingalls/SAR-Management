import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import { IssueResponse } from '../lib/types.js';
import { stringify } from 'csv-stringify/sync';
import Schema from '@openaddresses/batch-schema';
import { Issue } from '../lib/schema.js';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {

    await schema.get('/issue', {
        name: 'Get Issues',
        group: 'Issue',
        description: 'Get all issues for the Org',
        query: Type.Object({
            format: Type.String({
                default: 'json',
                enum: ['csv', 'json', 'vcard']
            }),
            fields: Type.Optional(Type.Array(Type.String({ enum: Object.keys(Issue) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Issue)})),
            assigned: Type.Optional(Type.Integer()),
            status: Type.String({
                default: 'open',
                enum: ['open', 'closed']
            }),
            filter: Type.Optional(Type.String())
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(IssueResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            if (['csv'].includes(req.query.format)) {
                if (req.query.format === 'csv') {
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', 'attachment; filename="sar-issues.csv"');
                    res.write(stringify([req.query.fields]));
                }

                (await config.models.Issue.stream()).on('data', async (issue) => {
                    if (req.query.format === 'csv') {
                        const line = [];
                        for (const field of (req.query.fields || [])) {
                            // @ts-expect-error Investigate
                            line.push(issue[field] === undefined ? '' : issue[field]);
                        }
                        res.write(stringify([line]));
                    }
                }).on('end', () => {
                    res.end();
                });
            } else {
                const list = await config.models.Issue.augmented_list({
                    limit: req.query.limit,
                    page: req.query.page,
                    order: req.query.order,
                    sort: req.query.sort,
                    where: sql`
                        (${req.query.filter}::TEXT IS NULL OR title ~* ${req.query.filter})
                        AND (${Param(req.query.assigned)}::INT IS NULL OR assigned_ids @> ARRAY[${Param(req.query.assigned)}::INT])
                        AND (${Param(req.query.status)}::TEXT IS NULL OR status  = ${Param(req.query.status)}::TEXT)
                    `
                })

                res.json(list);
            }
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/issue', {
        name: 'Create Issue',
        group: 'Issue',
        description: 'Create a new issue',
        body: Type.Object({
            title: Type.String(),
            body: Type.String(),
            assigned: Type.Optional(Type.Array(Type.Integer())),
            poll: Type.Optional(Type.Object({
                expiry: Type.Optional(Type.String()),
                questions: Type.Array(Type.Object({
                    name: Type.String()
                }))
            }))
        }),
        res: IssueResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.MANAGE);

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const poll = req.body.poll;
            delete req.body.poll;

            const issue = await config.models.Issue.generate({
                ...req.body,
                author: user.id
            });

            if (poll) {
                const p = await config.models.Poll.generate({
                    expiry: poll.expiry
                });

                for (const question of poll.questions) {
                    await config.models.PollQuestion.generate({ poll_id: p.id, question });
                }

                await config.models.Issue.commit(issue.id, { poll_id: p.id });
            }

            if (assigned) {
                for (const uid of assigned) {
                    await config.models.IssueAssigned.generate({
                        issue_id: issue.id,
                        uid: uid
                    });
                }
            }

            res.json(await config.models.Issue.augmented_from(issue.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/issue/:issueid', {
        name: 'Upodate Issue',
        group: 'Issue',
        description: 'Update an issue',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        body: Type.Object({
            title: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            status: Type.Optional(Type.String())
        }),
        res: IssueResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.MANAGE);

            const issue = await config.models.Issue.from(req.params.issueid);

            if (user.id !== issue.author && user.access !== 'admin') {
                if (req.body.status !== undefined) {
                    await config.models.Issue.commit(issue.id, {
                        status: req.body.status
                    });
                } else {
                    throw new Err(401, null, 'Cannot edit another\'s issue');
                }
            } else {
                await config.models.Issue.commit(issue.id, req.body);
            }

            res.json(await config.models.Issue.augmented_from(issue.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/issue/:issueid', {
        name: 'Get Issue',
        group: 'Issue',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Get an issue',
        res: IssueResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            res.json(await config.models.Issue.augmented_from(req.params.issueid));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
