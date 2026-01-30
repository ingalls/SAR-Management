import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { TrainingTag } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { StandardResponse, TrainingTagResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/training-tag', {
        name: 'List Tags',
        group: 'TrainingTag',
        description: 'Get all training tags for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(TrainingTag)})),
            filter: Type.Optional(Type.String({ default: '' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(TrainingTagResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Training, PermissionsLevel.VIEW);

            res.json(await config.models.TrainingTag.list({
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

    await schema.get('/training-tag/:tagid', {
        name: 'Get Tag',
        group: 'TrainingTag',
        description: 'Get a single training tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: TrainingTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Training, PermissionsLevel.VIEW);

            res.json(await config.models.TrainingTag.from(req.params.tagid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/training-tag', {
        name: 'Create Tag',
        group: 'TrainingTag',
        description: 'Create a new training tag',
        body: Type.Object({
            name: Type.String()
        }),
        res: TrainingTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Training, PermissionsLevel.ADMIN);

            const tag = await config.models.TrainingTag.generate(req.body);

            res.json(tag);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/training-tag/:tagid', {
        name: 'Update Tag',
        group: 'TrainingTag',
        description: 'Update an existing training tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String())
        }),
        res: TrainingTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Training, PermissionsLevel.ADMIN);

            const tag = await config.models.TrainingTag.commit(req.params.tagid, req.body);
            res.json(tag);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/training-tag/:tagid', {
        name: 'Delete Tag',
        group: 'TrainingTag',
        description: 'Delete an existing training tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Training, PermissionsLevel.ADMIN);

            await config.models.TrainingTag.delete(req.params.tagid);

            res.json({
                status: 200,
                message: 'Training Tag Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
