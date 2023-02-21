import Err from '@openaddresses/batch-error';
import Equipment from '../lib/types/equipment.js';
import EquipmentAssigned from '../lib/types/equipment-assigned.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/equipment', {
        name: 'List Equipment',
        group: 'Equipment',
        auth: 'user',
        description: 'Get all equipment in the Org',
        req: 'req.query.ListEquipment.json',
        res: 'res.ListEquipment.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Equipment:View');

            res.json(await Equipment.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/equipment/:equipmentid', {
        name: 'Get Equipment',
        group: 'Equipment',
        auth: 'user',
        description: 'Get a single equipment',
        ':equipmentid': 'integer',
        res: 'equipment.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Equipment:View');

            res.json(await Equipment.from(config.pool, req.params.equipmentid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/equipment', {
        name: 'Create Equipment',
        group: 'Equipment',
        auth: 'user',
        description: 'Create a new piece of equipment',
        body: 'req.body.CreateEquipment.json',
        res: 'equipment.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Equipment:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;

            const equipment = await Equipment.generate(config.pool, req.body);

            if (assigned) {
                for (const a of assigned) {
                    await EquipmentAssigned.generate(config.pool, {
                        equip_id: equipment.id,
                        uid: a.uid
                    });
                }
            }

            return res.json(equipment);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/equipment/:equipmentid', {
        name: 'Update Equipment',
        group: 'Equipment',
        auth: 'user',
        description: 'Update an existing piece of equipment',
        ':equipmentid': 'integer',
        body: 'req.body.PatchEquipment.json',
        res: 'equipment.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Equipment:Manage');

            const equipment = await Equipment.from(config.pool, req.params.equipmentid);

            await equipment.commit(req.body);
            return res.json(equipment);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
