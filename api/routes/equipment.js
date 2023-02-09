import Err from '@openaddresses/batch-error';
import Equipment from '../lib/types/equipment.js';
import EquipmentAssigned from '../lib/types/equipment-assigned.js';
import Auth from '../lib/auth.js';
import moment from 'moment';

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
            await Auth.is_auth(req);

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
            await Auth.is_auth(req);

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
            await Auth.is_auth(req);

            const equipment = await Equipment.generate(config.pool, {
                status: req.body.status,
                name: req.body.name
            });

            if (req.body.assigned) {
                for (const a of req.body.assigned) {
                    await EquipmentAssigned.generate(config.pool, {
                        equip_id: equipment.id,
                        uid: uid
                    });
                }
            }

            return res.json(equipement);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
