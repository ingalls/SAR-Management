import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import EquipmentType from '../lib/types/equipment-type.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/equipment-type', {
        name: 'List Type',
        group: 'EquipmentType',
        description: 'Get all equipment types in the Org',
        query: 'req.query.ListEquipmentTypes.json',
        res: 'res.ListEquipmentTypes.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            res.json(await EquipmentType.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/equipment-type/:typeid', {
        name: 'Get Type',
        group: 'EquipmentType',
        description: 'Get a single equipment type',
        params: Type.Object({
            typeid: Type.Integer()
        }),
        res: 'equipment_types.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            res.json(await EquipmentType.from(config.pool, req.params.typeid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/equipment-type', {
        name: 'Create Type',
        group: 'EquipmentType',
        description: 'Create a new type of equipment',
        body: 'req.body.CreateEquipmentType.json',
        res: 'equipment_types.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Admin');

            const type = await EquipmentType.generate(config.pool, req.body);
            return res.json(type);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/equipment-type/:typeid', {
        name: 'Update Type',
        group: 'Equipment',
        description: 'Update an existing type of equipment',
        params: Type.Object({
            typeid: Type.Integer()
        }),
        body: 'req.body.PatchEquipmentType.json',
        res: 'equipment_types.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Admin');

            const type = await EquipmentType.from(config.pool, req.params.typeid);
            await type.commit(req.body);
            return res.json(type);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
