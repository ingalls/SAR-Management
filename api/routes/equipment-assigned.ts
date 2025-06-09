import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { EquipmentAssignedResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/equipment/:equipmentid/assigned', {
        name: 'Get Assigned',
        group: 'EquipmentAssigned',
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
        description: 'Get users assigned to an mission',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(EquipmentAssignedResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Equipment, PermissionsLevel.VIEW);

            res.json(await config.models.EquipmentAssigned.augmented_list({
                where: sql`
                    equip_id = ${req.params.equipmentid}
                `
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
