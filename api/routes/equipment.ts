import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import { Param, GenericListOrder } from '@openaddresses/batch-generic';
import { streamCSV } from '../lib/csv.js';
import Notify from '../lib/notify.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { EquipmentResponse } from '../lib/types.js';
import { Equipment } from '../lib/schema.js';

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ensure a proposed parent exists and would not create a cycle in the
 * container hierarchy (an item cannot be its own ancestor)
 */
async function validateParent(config: Config, parent: number, self?: number): Promise<void> {
    const seen = new Set<number>();
    let current: number | null = parent;

    while (current) {
        if (self !== undefined && current === self) {
            throw new Err(400, null, 'Equipment cannot be placed inside itself or one of its own containers');
        }

        if (seen.has(current)) {
            throw new Err(400, null, 'Equipment hierarchy contains a cycle');
        }
        seen.add(current);

        const ancestor = await config.models.Equipment.from(current);
        current = ancestor.parent;
    }
}

export default async function router(schema: Schema, config: Config) {
    const notify = new Notify(config);

    const equipFields = new Set(Object.keys(Equipment));

    await schema.get('/equipment', {
        name: 'List Equipment',
        group: 'Equipment',
        description: 'Get all equipment in the Org',
        query: Type.Object({
            format: Type.String({ enum: ['csv', 'json'], default: 'json' }),
            fields: Type.Optional(Type.Array(Type.String({ enum: Array.from(equipFields) }))),
            limit: Type.Optional(Type.Integer()),
            assigned: Type.Optional(Type.Integer()),
            type_id: Type.Optional(Type.Integer()),
            container: Type.Optional(Type.Boolean()),
            archived: Type.Boolean({ default: false }),
            parent: Type.Optional(Type.Integer({ "description": "By default all equipment regardless of container status is returned. Set to 0 for root containers or to the parent ID for items in a specific container" })),
            page: Type.Optional(Type.Integer()),
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
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.VIEW);

            // User input is matched with ~* so escape regex metacharacters to
            // avoid a Postgres error on input like "(" or "["
            const filter = req.query.filter ? escapeRegex(req.query.filter) : null;

            const whereClause = sql`
                (
                    (${Param(req.query.parent)}::BIGINT IS NULL)
                    OR (${Param(req.query.parent)}::BIGINT = 0 AND parent IS NULL)
                    OR (${Param(req.query.parent)}::BIGINT IS NOT NULL AND parent = ${Param(req.query.parent)}::BIGINT)
                )
                AND (${Param(req.query.container)}::BOOLEAN IS NULL OR container = ${Param(req.query.container)})
                AND (${Param(req.query.archived)}::BOOLEAN IS NULL OR archived = ${Param(req.query.archived)})
                AND (${Param(req.query.type_id)}::INT IS NULL OR type_id = ${Param(req.query.type_id)}::INT)
                AND (${Param(filter)}::TEXT IS NULL OR name ~* ${Param(filter)})
                AND (${Param(req.query.assigned)}::INT IS NULL OR assigned_ids @> ARRAY[${Param(req.query.assigned)}::INT])
            `;

            if (req.query.format === 'csv') {
                await streamCSV(
                    res,
                    'sar-equipment.csv',
                    req.query.fields || ['name', 'status', 'description', 'quantity'],
                    (page, limit) => config.models.Equipment.augmented_list({
                        page, limit,
                        order: req.query.order,
                        sort: req.query.sort,
                        where: whereClause
                    }),
                    (equip, field) => {
                        if (field === 'assigned') {
                            return (equip.assigned || []).map((a: { fname: string, lname: string}) => `${a.fname} ${a.lname}`).join('; ');
                        }
                        return equip[field as keyof typeof equip];
                    }
                );
            } else {
                const list = await config.models.Equipment.augmented_list({
                    limit: req.query.limit,
                    page: req.query.page,
                    order: req.query.order,
                    sort: req.query.sort,
                    where: whereClause
                });

                res.json(list);
            }
        } catch (err) {
            Err.respond(err, res);
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
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.VIEW);

            res.json(await config.models.Equipment.augmented_from(req.params.equipmentid));
        } catch (err) {
            Err.respond(err, res);
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
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.MANAGE);

            if (req.body.parent) await validateParent(config, req.body.parent);

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

            res.json(await config.models.Equipment.augmented_from(equipment.id));
        } catch (err) {
            Err.respond(err, res);
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
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.MANAGE);

            const equipment = await config.models.Equipment.from(req.params.equipmentid);

            if (equipment.archived) {
                // The only change permitted on archived equipment is restoring it
                const keys = Object.keys(req.body);
                if (keys.length !== 1 || req.body.archived !== false) {
                    throw new Err(400, null, 'Cannot modify archived equipment');
                }
            }

            if (req.body.parent) await validateParent(config, req.body.parent, equipment.id);

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const old_assigned = (await config.models.EquipmentAssigned.list({
                where: sql`${equipment.id} = equip_id`
            })).items.map((assigned) => {
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

            res.json(await config.models.Equipment.augmented_from(equipment.id));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
