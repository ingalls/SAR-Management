import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { EquipmentIncident } from '../lib/schema.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import { EquipmentIncidentResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/equipment/:equipmentid/incident', {
        name: 'List Equipment Incidents',
        group: 'EquipmentIncident',
        description: 'Get all incidents for a piece of equipment',
        params: Type.Object({
            equipmentid: Type.Integer(),
        }),
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({ default: 'created', enum: Object.keys(EquipmentIncident) })),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(EquipmentIncidentResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.VIEW);

            res.json(await config.models.EquipmentIncident.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    equipment_id = ${req.params.equipmentid}
                    AND title ~* ${req.query.filter}
                `
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/equipment/:equipmentid/incident/:incidentid', {
        name: 'Get Equipment Incident',
        group: 'EquipmentIncident',
        description: 'Get a single equipment incident',
        params: Type.Object({
            equipmentid: Type.Integer(),
            incidentid: Type.Integer(),
        }),
        res: EquipmentIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.VIEW);

            const incident = await config.models.EquipmentIncident.from(req.params.incidentid);

            if (incident.equipment_id !== req.params.equipmentid) {
                throw new Err(400, null, 'Incident does not belong to this equipment');
            }

            res.json(incident);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/equipment/:equipmentid/incident', {
        name: 'Create Equipment Incident',
        group: 'EquipmentIncident',
        description: 'Create a new equipment incident',
        params: Type.Object({
            equipmentid: Type.Integer(),
        }),
        body: Type.Object({
            date: Type.String(),
            title: Type.String(),
            body: Type.Optional(Type.String()),
            mission_id: Type.Optional(Type.Integer()),
            training_id: Type.Optional(Type.Integer())
        }),
        res: EquipmentIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.MANAGE);

            const incident = await config.models.EquipmentIncident.generate({
                ...req.body,
                equipment_id: req.params.equipmentid
            });

            res.json(incident);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/equipment/:equipmentid/incident/:incidentid', {
        name: 'Update Equipment Incident',
        group: 'EquipmentIncident',
        description: 'Update an existing equipment incident',
        params: Type.Object({
            equipmentid: Type.Integer(),
            incidentid: Type.Integer(),
        }),
        body: Type.Object({
            date: Type.Optional(Type.String()),
            title: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            mission_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
            training_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()]))
        }),
        res: EquipmentIncidentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.MANAGE);

            const incident = await config.models.EquipmentIncident.from(req.params.incidentid);

            if (incident.equipment_id !== req.params.equipmentid) {
                throw new Err(400, null, 'Incident does not belong to this equipment');
            }

            const updated = await config.models.EquipmentIncident.commit(req.params.incidentid, req.body);
            res.json(updated);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/equipment/:equipmentid/incident/:incidentid', {
        name: 'Delete Equipment Incident',
        group: 'EquipmentIncident',
        description: 'Delete an equipment incident',
        params: Type.Object({
            equipmentid: Type.Integer(),
            incidentid: Type.Integer(),
        }),
        res: Type.Object({
            status: Type.Integer(),
            message: Type.String()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.ADMIN);

            const incident = await config.models.EquipmentIncident.from(req.params.incidentid);

            if (incident.equipment_id !== req.params.equipmentid) {
                throw new Err(400, null, 'Incident does not belong to this equipment');
            }

            await config.models.EquipmentIncident.delete(req.params.incidentid);
            res.json({
                status: 200,
                message: 'Equipment Incident Deleted'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
