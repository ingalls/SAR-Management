import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import Notify from '../lib/notify.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { EquipmentResponse } from '../lib/types.js';
import { Equipment } from '../lib/schema.js';

export default async function router(schema: Schema, config: Config) {
    const notify = new Notify(config);

    await schema.get('/equipment', {
        name: 'List Equipment',
        group: 'Equipment',
        description: 'Get all equipment in the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            assigned: Type.Optional(Type.Integer()),
            container: Type.Optional(Type.Boolean()),
            archived: Type.Optional(Type.Boolean()),
            parent: Type.Optional(Type.Integer({ "description": "By default all equipment regardless of container status is returned. Set to 0 for root containers or to the parent ID for items in a specific container" })),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Equipment)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(EquipmentResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            res.json(await config.models.Equipment.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    (
                        (${Param(req.query.parent)}::BIGINT IS NULL)
                        OR (${Param(req.query.parent)}::BIGINT = 0 AND parent IS NULL)
                        OR (${Param(req.query.parent)}::BIGINT IS NOT NULL AND parent = ${Param(req.query.parent)}::BIGINT)
                    )
                    AND (${Param(req.query.container)}::BOOLEAN IS NULL OR container = ${Param(req.query.container)})
                    AND (${Param(req.query.archived)}::BOOLEAN IS NULL OR archived = ${Param(req.query.archived)})
                    AND (${Param(req.query.filter)}::TEXT IS NULL OR name ~* ${Param(req.query.filter)})
                    AND (${Param(req.query.assigned)}::BIGINT IS NULL OR equipment_assigned.uid = ${Param(req.query.assigned)})
                `
            }))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/equipment/:equipmentid', {
        name: 'Get Equipment',
        group: 'Equipment',
        description: 'Get a single equipment',
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
        res: EquipmentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            res.json(await config.models.Equipment.augmented_from(req.params.equipmentid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/equipment', {
        name: 'Create Equipment',
        group: 'Equipment',
        description: 'Create a new piece of equipment',
        body: Type.Object({
            name: Type.String(),
            description: Type.String(),
            type_id: Type.Optional(Type.Integer()),
            container: Type.Optional(Type.Boolean()),
            parent: Type.Optional(Type.Integer()),
            quantity: Type.Optional(Type.Integer()),
            value: Type.Optional(Type.Integer()),
            meta: Type.Optional(Type.Any()),
            assigned: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: EquipmentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const equipment = await config.models.Equipment.generate(req.body);

            if (assigned) {
                for (const uid of assigned) {
                    await config.models.EquipmentAssigned.generate({ equip_id: equipment.id, uid });
                    await notify.generate('Equipment', uid, {
                        text: `Equipment: ${equipment.name} has been assigned to you`,
                        url: `/equipment/${equipment.id}`
                    });
                }
            }

            return res.json(await config.models.Equipment.augmented_from(equipment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/equipment/:equipmentid', {
        name: 'Update Equipment',
        group: 'Equipment',
        description: 'Update an existing piece of equipment',
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
        body: Type.Object({
            name: Type.Optional(Type.String()),
            description: Type.Optional(Type.String()),
            archived: Type.Optional(Type.Boolean()),
            type_id: Type.Optional(Type.Integer()),
            container: Type.Optional(Type.Boolean()),
            parent: Type.Optional(Type.Integer()),
            quantity: Type.Optional(Type.Integer()),
            value: Type.Optional(Type.Integer()),
            meta: Type.Optional(Type.Any()),
            assigned: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: EquipmentResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Manage');

            const equipment = await config.models.Equipment.from(req.params.equipmentid);

            if (equipment.archived) {
                throw new Err(400, null, 'Cannot modify archived equipment');
            }

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const old_assigned = (await config.models.EquipmentAssigned.list(equipment.id)).items.map((assigned) => {
                return assigned.uid;
            });

            await config.models.Equipment.commit(req.params.equipmentid, req.body);

            if (Array.isArray(assigned)) {
                await config.models.EquipmentAssigned.delete(sql`equip_id = ${equipment.id}`);

                for (const uid of assigned) {
                    await config.models.EquipmentAssigned.generate({
                        equip_id: equipment.id, uid
                    });

                    if (!old_assigned.includes(uid)) {
                        await notify.generate('Equipment', uid, {
                            text: `Equipment: ${equipment.name} has been assigned to you`,
                            url: `/equipment/${equipment.id}`
                        });
                    }
                }

                for (const uid of old_assigned) {
                    if (!assigned.includes(uid)) {
                        await notify.generate('Equipment', uid, {
                            text: `Equipment: ${equipment.name} has been unassigned to you`,
                            url: `/equipment/${equipment.id}`
                        });
                    }
                }
            }

            return res.json(await config.models.Equipment.augmented_from(equipment.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
