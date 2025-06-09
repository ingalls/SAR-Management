import Err from '@openaddresses/batch-error';
import { ApplicationComment } from '../lib/schema.js';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import { sql } from 'drizzle-orm';
import { StandardResponse, ApplicationCommentResponse } from '../lib/types.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/application/:applicationid/comment', {
        name: 'Get Comments',
        group: 'AppComments',
        description: 'Get all comments for a given application',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(ApplicationComment)}))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ApplicationCommentResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.VIEW);

            res.json(await config.models.ApplicationComment.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    application = ${req.params.applicationid}
                `
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/application/:applicationid/comment/:commentid', {
        name: 'Archive Comment',
        group: 'AppComments',
        params: Type.Object({
            applicationid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Archive an application comment',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.MANAGE);

            const comment = await config.models.ApplicationComment.from(req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

            await Auth.is_own_or_iam(config, req, comment.author, IamGroup.Application, PermissionsLevel.ADMIN);

            await config.models.ApplicationComment.delete(comment.id);

            res.json({
                status: 200,
                message: 'Comment Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/application/:applicationid/comment/:commentid', {
        name: 'Update Comment',
        group: 'AppComments',
        params: Type.Object({
            applicationid: Type.Integer(),
            commentid: Type.Integer()
        }),
        description: 'Update an application comment',
        body: Type.Object({
            body: Type.Optional(Type.String())
        }),
        res: ApplicationCommentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.MANAGE);

            const comment = await config.models.ApplicationComment.from(req.params.commentid);
            if (comment.application !== req.params.applicationid) throw new Err(400, null, 'Comment does not belong to given application');

            await Auth.is_own_or_iam(config, req, comment.author, IamGroup.Application, PermissionsLevel.ADMIN);

            await config.models.ApplicationComment.commit(comment.id, {
                updated: sql`Now()`,
                ...req.body
            })

            res.json(await config.models.ApplicationComment.augmented_from(comment.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/application/:applicationid/comment', {
        name: 'Create Comment',
        group: 'AppComments',
        params: Type.Object({
            applicationid: Type.Integer(),
        }),
        description: 'Create a new application comment',
        body: Type.Object({
            body: Type.String()
        }),
        res: ApplicationCommentResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.MANAGE);

            const comment = await config.models.ApplicationComment.generate({
                application: req.params.applicationid,
                author: user.id,
                ...req.body
            });

            res.json(await config.models.ApplicationComment.augmented_from(comment.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
