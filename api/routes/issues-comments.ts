import { Type } from '@sinclair/typebox';
import { IssueComment } from '../lib/schema.js';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import { sql } from 'drizzle-orm';
import Schema from '@openaddresses/batch-schema';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Config from '../lib/config.js';
import { StandardResponse, IssueCommentResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/comment', {
        name: 'Get Comments',
        group: 'Comments',
        description: 'Get all comments for a given issue',
        params: Type.Object({
            issueid: Type.Integer()
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(IssueComment)}))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(IssueCommentResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:View');

            res.json(await config.models.IssueComment.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    issue ~* ${req.params.issueid}
                `
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/issue/:issueid/comment/:commentid', {
        name: 'Archive Comment',
        group: 'Comments',
        params: Type.Object({
            issueid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Archive an issue comment',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:Manage');

            const comment = await config.models.IssueComment.from(req.params.commentid);
            if (comment.issue !== req.params.issueid) throw new Err(400, null, 'Comment does not belong to given issue');

            await Auth.is_own_or_iam(config, req, comment.author, 'Admin');

            await config.models.IssueComment.delete(req.params.commentid);

            return res.json({
                status: 200,
                message: 'Comment Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/issue/:issueid/comment/:commentid', {
        name: 'Update Comment',
        group: 'Comments',
        params: Type.Object({
            issueid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Update an issue comment',
        body: Type.Object({
            body: Type.String()
        }),
        res: IssueCommentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:Manage');

            const comment = await config.models.IssueComment.from(req.params.commentid);
            if (comment.issue !== req.params.issueid) throw new Err(400, null, 'Comment does not belong to given issue');

            await Auth.is_own_or_iam(config, req, comment.author, 'Admin');

            await config.models.IssueComment.commit(req.params.commentid, {
                updated: sql`Now()`,
                ...req.body
            })

            return res.json(await config.models.IssueComment.augmented_from(comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/comment', {
        name: 'Create Comment',
        group: 'Comments',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Create a new issue comment',
        body: Type.Object({
            body: Type.String()
        }),
        res: IssueCommentResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, 'Issue:Manage');

            const comment = await config.models.IssueComment.generate({
                issue: req.params.issueid,
                author: user.id,
                ...req.body
            });

            return res.json(await config.models.IssueComment.augmented_from(comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
