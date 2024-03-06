import Err from '@openaddresses/batch-error';
import IssueComment from '../lib/types/issue-comment.js';
import ViewIssueComment from '../lib/views/issue-comment.js';
import Auth from '../lib/auth.js';
import { sql } from 'slonik';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/comment', {
        name: 'Get Comments',
        group: 'Comments',
        auth: 'user',
        description: 'Get all comments for a given issue',
        params: Type.Object({
            issueid: Type.Integer()
        }),
        query: 'req.query.ListIssueComments.json',
        res: 'res.ListIssueComments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            res.json(await ViewIssueComment.list(config.pool, req.params.issueid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/issue/:issueid/comment/:commentid', {
        name: 'Archive Comment',
        group: 'Comments',
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Archive an issue comment',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const comment = await IssueComment.from(config.pool, req.params.commentid);
            if (comment.issue !== req.params.issueid) throw new Err(400, null, 'Comment does not belong to given issue');

            await Auth.is_own_or_iam(req, comment.author, 'Admin');

            await comment.delete();

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
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Update an issue comment',
        body: 'req.body.PatchIssueComment.json',
        res: 'view_issues_comments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const comment = await IssueComment.from(config.pool, req.params.commentid);
            if (comment.issue !== req.params.issueid) throw new Err(400, null, 'Comment does not belong to given issue');

            await Auth.is_own_or_iam(req, comment.author, 'Admin');

            await comment.commit({
                updated: sql`Now()`,
                ...req.body
            })

            return res.json(await ViewIssueComment.from(config.pool, comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/comment', {
        name: 'Create Comment',
        group: 'Comments',
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Create a new issue comment',
        body: 'req.body.CreateIssueComment.json',
        res: 'view_issues_comments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const comment = await IssueComment.generate(config.pool, {
                issue: req.params.issueid,
                author: req.auth.id,
                ...req.body
            });

            return res.json(await ViewIssueComment.from(config.pool, comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
