import Err from '@openaddresses/batch-error';
import ApplicationComment from '../lib/types/application-comment.js';
import ViewApplicationComment from '../lib/views/application-comment.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/application/:applicationid/comment', {
        name: 'Get Comments',
        group: 'AppComments',
        auth: 'user',
        description: 'Get all comments for a given application',
        ':applicationid': 'integer',
        query: 'req.query.ListApplicationComments.json',
        res: 'res.ListApplicationComments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            res.json(await ViewApplicationComment.list(config.pool, req.params.applicationid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/application/:applicationid/comment/:commentid', {
        name: 'Archive Comment',
        group: 'AppComments',
        auth: 'user',
        ':applicationid': 'integer',
        ':commentid': 'integer',
        description: 'Archive an application comment',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:Manage');

            const comment = await ApplicationComment.from(config.pool, req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

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

    await schema.patch('/application/:applicationid/comment/:commentid', {
        name: 'Update Comment',
        group: 'AppComments',
        auth: 'user',
        ':applicationid': 'integer',
        ':commentid': 'integer',
        description: 'Update an application comment',
        body: 'req.body.PatchApplicationComment.json',
        res: 'view_application_comments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const comment = await ApplicationComment.from(config.pool, req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

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

    await schema.post('/application/:applicationid/comment', {
        name: 'Create Comment',
        group: 'AppComments',
        auth: 'user',
        ':applicationid': 'integer',
        description: 'Create a new application comment',
        body: 'req.body.CreateApplicationComment.json',
        res: 'view_application_comments.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:Manage');

            const comment = await ApplicationComment.generate(config.pool, {
                application: req.params.applicationid,
                author: req.auth.id,
                ...req.body
            });

            return res.json(await ViewApplicationComment.from(config.pool, comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
