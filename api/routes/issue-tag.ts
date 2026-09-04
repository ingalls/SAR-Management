import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { IssueTag } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { TagVisualFields, validateTagVisuals } from '../lib/tag.js';
import { StandardResponse, IssueTagResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue-tag', {
        name: 'List Tags',
        group: 'IssueTag',
        description: 'Get all issue tags for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(IssueTag)})),
            filter: Type.Optional(Type.String({ default: '' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(IssueTagResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            res.json(await config.models.IssueTag.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/issue-tag/:tagid', {
        name: 'Get Tag',
        group: 'IssueTag',
        description: 'Get a single issue tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: IssueTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            res.json(await config.models.IssueTag.from(req.params.tagid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/issue-tag', {
        name: 'Create Tag',
        group: 'IssueTag',
        description: 'Create a new issue tag',
        body: Type.Object({
            name: Type.String(),
            ...TagVisualFields
        }),
        res: IssueTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.ADMIN);

            validateTagVisuals(req.body);

            const tag = await config.models.IssueTag.generate(req.body);

            res.json(tag);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/issue-tag/:tagid', {
        name: 'Update Tag',
        group: 'IssueTag',
        description: 'Update an existing issue tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String()),
            ...TagVisualFields
        }),
        res: IssueTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.ADMIN);

            validateTagVisuals(req.body);

            const tag = await config.models.IssueTag.commit(req.params.tagid, req.body);
            res.json(tag);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/issue-tag/:tagid', {
        name: 'Delete Tag',
        group: 'IssueTag',
        description: 'Remove an existing issue tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.ADMIN);

            await config.models.IssueTag.delete(req.params.tagid);

            res.json({
                status: 200,
                message: 'Issue Tag Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
