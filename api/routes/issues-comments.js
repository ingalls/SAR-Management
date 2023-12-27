import Err from '@openaddresses/batch-error';
import IssueComment from '../lib/types/issue-comment.js';
import ViewIssueComment from '../lib/views/issue-comment.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/issue/:issueid/comment', {
        name: 'Get Comments',
        group: 'Comments',
        auth: 'user',
        description: 'Get all comments for a given issue',
        ':issueid': 'integer',
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
        ':issueid': 'integer',
        ':commentid': 'integer',
        description: 'Archive an issue comment',
        res: 'res.Standard.json'
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

    await schema.post('/issue/:issueid/comment', {
        name: 'Create Comment',
        group: 'Comments',
        auth: 'user',
        ':issueid': 'integer',
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
