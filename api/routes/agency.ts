import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { Agency } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { StandardResponse, AgencyResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/agency', {
        name: 'List Agencies',
        group: 'Agency',
        description: 'Get all agencies',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Agency)})),
            filter: Type.Optional(Type.String({ default: '' })),
            archived: Type.Optional(Type.Boolean({ default: false })),
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(AgencyResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            res.json(await config.models.Agency.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                    AND archived = ${req.query.archived}
                `
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/agency/:agencyid', {
        name: 'Get Agency',
        group: 'Agency',
        description: 'Get a single agency',
        params: Type.Object({
            agencyid: Type.Integer(),
        }),
        res: AgencyResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            res.json(await config.models.Agency.from(req.params.agencyid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/agency', {
        name: 'Create Agency',
        group: 'Agency',
        description: 'Create a new agency',
        body: Type.Object({
            name: Type.String(),
            logo: Type.Optional(Type.String())
        }),
        res: AgencyResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const agency = await config.models.Agency.generate({
                name: req.body.name,
                logo: req.body.logo || ''
            });

            res.json(agency);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/agency/:agencyid', {
        name: 'Update Agency',
        group: 'Agency',
        description: 'Update an existing agency',
        params: Type.Object({
            agencyid: Type.Integer(),
        }),
        body: Type.Object({
            name: Type.Optional(Type.String()),
            logo: Type.Optional(Type.String())
        }),
        res: AgencyResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const agency = await config.models.Agency.commit(req.params.agencyid, req.body);
            res.json(agency);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/agency/:agencyid', {
        name: 'Archive Agency',
        group: 'Agency',
        description: 'Archive an agency (soft delete)',
        params: Type.Object({
            agencyid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            await config.models.Agency.commit(req.params.agencyid, {
                archived: true
            });

            res.json({
                status: 200,
                message: 'Agency Archived'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
