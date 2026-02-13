import Err from '@openaddresses/batch-error';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, MissionPersonResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/mission/:missionid/person', {
        name: 'List Persons',
        group: 'MissionPerson',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        description: 'Get people associated with a mission',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(MissionPersonResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            res.json(await config.models.MissionPerson.list({
                limit: 1000,
                where: sql`mission_id = ${req.params.missionid}`
            }))
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.post('/mission/:missionid/person', {
        name: 'Create Person',
        group: 'MissionPerson',
        params: Type.Object({
            missionid: Type.Integer(),
        }),
        description: 'Create a person record for a mission',
        body: Type.Object({
            name: Type.Optional(Type.String()),
            address: Type.Optional(Type.String()),
            role: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            notes: Type.Optional(Type.String()),
        }),
        res: MissionPersonResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            const person = await config.models.MissionPerson.generate({
                mission_id: req.params.missionid,
                ...req.body
            });

            res.json(person);
        } catch (err) {
             Err.respond(err, res);
        }
    });


    await schema.get('/mission/:missionid/person/:personid', {
        name: 'Get Person',
        group: 'MissionPerson',
        params: Type.Object({
            missionid: Type.Integer(),
            personid: Type.Integer()
        }),
        description: 'Get a person record',
        res: MissionPersonResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.VIEW);

            const person = await config.models.MissionPerson.from(req.params.personid);

            res.json(person);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.patch('/mission/:missionid/person/:personid', {
        name: 'Update Person',
        group: 'MissionPerson',
        params: Type.Object({
            missionid: Type.Integer(),
            personid: Type.Integer()
        }),
        description: 'Update a person record',
        body: Type.Object({
            name: Type.Optional(Type.String()),
            address: Type.Optional(Type.String()),
            role: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            notes: Type.Optional(Type.String()),
        }),
        res: MissionPersonResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            const person = await config.models.MissionPerson.commit(req.params.personid, req.body);

            res.json(person);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/mission/:missionid/person/:personid', {
        name: 'Delete Person',
        group: 'MissionPerson',
        params: Type.Object({
            missionid: Type.Integer(),
            personid: Type.Integer()
        }),
        description: 'Delete a person record',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Mission, PermissionsLevel.MANAGE);

            await config.models.MissionPerson.delete(req.params.personid);

            res.json({
                status: 200,
                message: 'Person Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
