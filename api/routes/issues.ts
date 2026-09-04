import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { sql, SQL } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import { IssueResponse } from '../lib/types.js';
import { stringify } from 'csv-stringify/sync';
import Schema from '@openaddresses/batch-schema';
import { Issue } from '../lib/schema.js';
import Config from '../lib/config.js';

/**
 * Parse a comma separated list of IDs from a query param
 */
function parseIds(name: string, value?: string): number[] {
    if (!value) return [];

    return value.split(',').map((v) => v.trim()).filter((v) => v.length).map((v) => {
        const id = Number(v);
        if (!Number.isInteger(id)) throw new Err(400, null, `${name} must be a comma separated list of integer IDs`);
        return id;
    });
}

function likePattern(filter: string): string {
    return `%${filter.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Build the WHERE clause for the issue list. Operates on the augmented issue
 * row so the assigned_ids & tags_id aggregates are available
 */
export function issueFilter(query: {
    filter?: string;
    assigned?: number;
    author?: number;
    tag?: string;
    poll?: boolean;
    status?: string;
}): SQL {
    const conditions: SQL[] = [];

    if (query.filter && query.filter.trim().length) {
        const pattern = likePattern(query.filter.trim());
        conditions.push(sql`(title ILIKE ${pattern} OR body ILIKE ${pattern})`);
    }

    if (query.assigned !== undefined) conditions.push(sql`assigned_ids @> ARRAY[${Param(query.assigned)}::INT]`);
    if (query.author !== undefined) conditions.push(sql`author = ${Param(query.author)}::INT`);

    const tags = parseIds('tag', query.tag);
    if (tags.length) {
        conditions.push(sql`tags_id && ARRAY[${sql.join(tags.map((id) => sql`${Param(id)}::INT`), sql`, `)}]`);
    }

    if (query.poll === true) conditions.push(sql`poll_id IS NOT NULL`);
    else if (query.poll === false) conditions.push(sql`poll_id IS NULL`);

    if (query.status && query.status !== 'all') conditions.push(sql`status = ${Param(query.status)}::TEXT`);

    if (!conditions.length) return sql`TRUE`;

    return sql.join(conditions, sql` AND `);
}

/**
 * Replace the set of tags assigned to an issue
 */
async function setTags(config: Config, issueId: number, tags: number[]): Promise<void> {
    await config.models.IssueTagAssigned.delete(sql`issue_id = ${issueId}`);

    for (const tag_id of new Set(tags)) {
        await config.models.IssueTagAssigned.generate({ issue_id: issueId, tag_id });
    }
}

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
            assigned: Type.Optional(Type.Integer({ description: 'Only issues assigned to this User ID' })),
            author: Type.Optional(Type.Integer({ description: 'Only issues created by this User ID' })),
            tag: Type.Optional(Type.String({ description: 'Comma separated Tag IDs - only issues with any of these tags' })),
            poll: Type.Optional(Type.Boolean({ description: 'true: only issues with a poll, false: only issues without' })),
            status: Type.String({
                default: 'open',
                enum: ['open', 'closed', 'all']
            }),
            filter: Type.Optional(Type.String({ description: 'Case insensitive search across title & body' }))
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
                            line.push((issue as Record<string, any>)[field] === undefined ? '' : (issue as Record<string, any>)[field]);
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
                    where: issueFilter(req.query)
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
            tags: Type.Optional(Type.Array(Type.Integer())),
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
            const tags = req.body.tags;
            delete req.body.tags;
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

            if (tags) await setTags(config, issue.id, tags);

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
            status: Type.Optional(Type.String({ enum: ['open', 'closed'] })),
            tags: Type.Optional(Type.Array(Type.Integer(), { description: 'Replace the tags assigned to the issue' }))
        }),
        res: IssueResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.MANAGE);

            const issue = await config.models.Issue.from(req.params.issueid);

            const tags = req.body.tags;
            delete req.body.tags;

            // Status & tags are triage metadata anyone with Manage may change;
            // the title & body remain the author's (or an admin's)
            if (user.id !== issue.author && user.access !== 'admin') {
                if (req.body.title !== undefined || req.body.body !== undefined) {
                    throw new Err(401, null, 'Cannot edit another\'s issue');
                }
            }

            if (Object.keys(req.body).length) {
                await config.models.Issue.commit(issue.id, {
                    ...req.body,
                    updated: sql`Now()`
                });
            }

            if (tags) await setTags(config, issue.id, tags);

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
