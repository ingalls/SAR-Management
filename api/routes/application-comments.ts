import Err from '@openaddresses/batch-error';
import Auth, { AuthRequest } from '../lib/auth.js';
import { Response } from 'express';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';

export default async function router(schema: any, config: Config) {
    await schema.get('/application/:applicationid/comment', {
        name: 'Get Comments',
        group: 'AppComments',
        auth: 'user',
        description: 'Get all comments for a given application',
        ':applicationid': 'integer',
        query: 'req.query.ListApplicationComments.json',
        res: 'res.ListApplicationComments.json'
    }, async (req: AuthRequest, res: Response) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            res.json(await config.models.ApplicationComment.augmented_list({
                limit: Number(req.query.limit),
                page: Number(req.query.page),
                order: String(req.query.order),
                sort: String(req.query.sort),
                where: sql`
                    application ~* ${req.params.applicationid}
                `
            }));
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
    }, async (req: AuthRequest, res: Response) => {
        try {
            await Auth.is_iam(req, 'Application:Manage');

            const comment = await config.models.ApplicationComment.from(req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

            await Auth.is_own_or_iam(req, comment.author, 'Admin');

            await config.models.ApplicationComment.delete(comment.id);

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
    }, async (req: AuthRequest, res: Response) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const comment = await config.models.ApplicationComment.from(req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

            await Auth.is_own_or_iam(req, comment.author, 'Admin');

            await config.models.ApplicationComment.commit(comment.id, {
                updated: sql`Now()`,
                ...req.body
            })

            return res.json(await config.models.ApplicationComment.augmented_from(comment.id));
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
    }, async (req: AuthRequest, res: Response) => {
        try {
            await Auth.is_iam(req, 'Application:Manage');

            const comment = await config.models.ApplicationComment.generate({
                application: req.params.applicationid,
                author: req.auth.id,
                ...req.body
            });

            return res.json(await config.models.ApplicationComment.augmented_from(comment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
