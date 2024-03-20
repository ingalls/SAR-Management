import Err from '@openaddresses/batch-error';
import EquipmentAssigned from '../lib/types/equipment-assigned.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/equipment/:equipmentid/assigned', {
        name: 'Get Assigned',
        group: 'EquipmentAssigned',
        auth: 'user',
        params: Type.Object({
            equipmentid: Type.Integer()
        }),
        description: 'Get users assigned to an mission',
        res: 'res.ListEquipmentAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            res.json(await EquipmentAssigned.list(config.pool, req.params.equipmentid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
