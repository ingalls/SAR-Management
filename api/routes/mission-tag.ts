import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { MissionTag } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { StandardResponse, MissionTagResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission-tag', {
        name: 'List Tags',
        group: 'MissionTag',
        description: 'Get all mission tags for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(MissionTag)})),
            filter: Type.Optional(Type.String({ default: '' })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionTagResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await config.models.MissionTag.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/mission-tag/:tagid', {
        name: 'Get Tag',
        group: 'MissionTag',
        description: 'Get a single mission tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: MissionTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:View');

            res.json(await config.models.MissionTag.from(req.params.tagid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/mission-tag', {
        name: 'Create Tag',
        group: 'MissionTag',
        description: 'Create a new mission tag',
        body: Type.Object({
            name: Type.String()
        }),
        res: MissionTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const tag = await config.models.MissionTag.generate(req.body);

            return res.json(tag);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/mission-tag/:tagid', {
        name: 'Update Tag',
        group: 'MissionTag',
        description: 'Update an existing mission tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String())
        }),
        res: MissionTagResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            const tag = await config.models.MissionTag.commit(req.params.tagid, req.body);
            return res.json(tag);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/mission-tag/:tagid', {
        name: 'Delete Tag',
        group: 'MissionTag',
        description: 'Remove an existing mission tag',
        params: Type.Object({
            tagid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Mission:Admin');

            await config.models.MissionTag.delete(req.params.tagid);

            return res.json({
                status: 200,
                message: 'Mission Tag Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
