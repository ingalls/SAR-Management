import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { EquipmentTypeResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/equipment-type', {
        name: 'List Type',
        group: 'EquipmentType',
        description: 'Get all equipment types in the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            filter: Type.Optional(Type.String())
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(EquipmentTypeResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            // @ts-expect-error TODO Fix Type
            res.json(await config.models.EquipmentType.list(req.query));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/equipment-type/:typeid', {
        name: 'Get Type',
        group: 'EquipmentType',
        description: 'Get a single equipment type',
        params: Type.Object({
            typeid: Type.Integer()
        }),
        res: EquipmentTypeResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:View');

            // @ts-expect-error TODO Fix Type
            res.json(await config.models.EquipmentType.from(req.params.typeid));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/equipment-type', {
        name: 'Create Type',
        group: 'EquipmentType',
        description: 'Create a new type of equipment',
        body: Type.Object({
            type: Type.String(),
            schema: Type.Any()
        }),
        res: EquipmentTypeResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Admin');

            const type = await config.models.EquipmentType.generate(req.body);

            // @ts-expect-error TODO Fix Type
            res.json(type);
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/equipment-type/:typeid', {
        name: 'Update Type',
        group: 'Equipment',
        description: 'Update an existing type of equipment',
        params: Type.Object({
            typeid: Type.Integer()
        }),
        body: Type.Object({
            type: Type.Optional(Type.String()),
            schema: Type.Optional(Type.Any())
        }),
        res: EquipmentTypeResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Equipment:Admin');

            const type = await config.models.EquipmentType.commit(req.params.typeid, req.body);

            // @ts-expect-error TODO Fix Type
            res.json(type);
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
