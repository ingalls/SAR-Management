import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { sql } from 'drizzle-orm';
import { UserIncident } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { UserIncidentResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/incident', {
        name: 'List User Incidents',
        group: 'UserIncident',
        description: 'Get all user incidents',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(UserIncident)})),
            filter: Type.Optional(Type.String({ default: '' })),
            uid: Type.Optional(Type.Integer())
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(UserIncidentResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Incident, PermissionsLevel.VIEW);

            const query: any = {
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    title ~* ${req.query.filter}
                `
            };

            if (req.query.uid) {
                query.where = sql`${query.where} AND uid = ${req.query.uid}`;
            }

            res.json(await config.models.UserIncident.list(query));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/incident/:incidentid', {
        name: 'Get User Incident',
        group: 'UserIncident',
        description: 'Get a single user incident',
        params: Type.Object({
            incidentid: Type.Integer(),
        }),
        res: UserIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Incident, PermissionsLevel.VIEW);

            res.json(await config.models.UserIncident.from(req.params.incidentid));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/incident', {
        name: 'Create User Incident',
        group: 'UserIncident',
        description: 'Create a new user incident',
        body: Type.Object({
            date: Type.String(),
            title: Type.String(),
            severity: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            uid: Type.Integer(),
            mission_id: Type.Optional(Type.Integer()),
            training_id: Type.Optional(Type.Integer())
        }),
        res: UserIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Incident, PermissionsLevel.MANAGE);

            const incident = await config.models.UserIncident.generate(req.body);

            res.json(incident);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/incident/:incidentid', {
        name: 'Update User Incident',
        group: 'UserIncident',
        description: 'Update an existing user incident',
        params: Type.Object({
            incidentid: Type.Integer(),
        }),
        body: Type.Object({
            date: Type.Optional(Type.String()),
            title: Type.Optional(Type.String()),
            severity: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            uid: Type.Optional(Type.Integer()),
            mission_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
            training_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()]))
        }),
        res: UserIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Incident, PermissionsLevel.MANAGE);

            const incident = await config.models.UserIncident.commit(req.params.incidentid, req.body);
            res.json(incident);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/incident/:incidentid', {
        name: 'Delete User Incident',
        group: 'UserIncident',
        description: 'Delete a user incident',
        params: Type.Object({
            incidentid: Type.Integer(),
        }),
        res: Type.Object({
            status: Type.Integer(),
            message: Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Incident, PermissionsLevel.ADMIN);

            await config.models.UserIncident.delete(req.params.incidentid);
            res.json({
                status: 200,
                message: 'Incident Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
