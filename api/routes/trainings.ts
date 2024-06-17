import Err from '@openaddresses/batch-error';
import { GenericListOrder, Param } from '@openaddresses/batch-generic';
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import { Training } from '../lib/schema.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, TrainingResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/training', {
        name: 'List Trainings',
        group: 'Training',
        description: 'Get all trainings for the Org',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            start: Type.Optional(Type.String()),
            end: Type.Optional(Type.String()),
            assigned: Type.Optional(Type.Integer()),
            required: Type.Optional(Type.Boolean()),
            team: Type.Optional(Type.Integer()),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Training)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(TrainingResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:View');

            res.json(await config.models.Training.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    (${req.query.filter}::TEXT IS NULL OR title ~* ${req.query.filter})
                    AND (${Param(req.query.assigned)}::BIGINT IS NULL OR users @> ARRAY[${Param(req.query.assigned)}::BIGINT])
                    AND (${Param(req.query.team)}::BIGINT IS NULL OR teams_id @> ARRAY[${Param(req.query.team)}::BIGINT])
                    AND (${Param(req.query.required)}::BOOLEAN IS NULL OR required = ${Param(req.query.required)})
                    AND (${Param(req.query.start)}::TIMESTAMP IS NULL OR start_ts >= ${Param(req.query.start)}::TIMESTAMP)
                    AND (${Param(req.query.end)}::TIMESTAMP IS NULL OR end_ts <= ${Param(req.query.end)}::TIMESTAMP)
                `
            }))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/training/:trainingid', {
        name: 'Get Training',
        group: 'Training',
        description: 'Get a single Training',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        res: TrainingResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:View');

            const training = await config.models.Training.augmented_from(req.params.trainingid);
            if (!training.users) training.users = [];
            return res.json(training);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training', {
        name: 'Create Training',
        group: 'Training',
        description: 'Create a new training',
        body: Type.Object({
            title: Type.String(),
            body: Type.String(),
            start_ts: Type.String(),
            end_ts: Type.String(),
            location: Type.String(),
            location_geom: Type.Optional(Type.Any()),
            required: Type.Boolean({ default: false }),
            assigned: Type.Optional(Type.Array(Type.Object({
                role: Type.String(),
                confirmed: Type.Boolean(),
                uid: Type.Integer()
            }))),
            teams: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: TrainingResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, 'Training:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;

            const training = await config.models.Training.generate({
                ...req.body,
                author: user.id
            });

            if (assigned) {
                for (const a of assigned) {
                    await config.models.TrainingAssigned.generate({
                        training_id: training.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: a.uid
                    });
                }
            }

            if (teams) {
                for (const a of teams) {
                    await config.models.TrainingTeam.generate({
                        training_id: training.id,
                        team_id: a
                    });
                }
            }

            return res.json(await config.models.Training.augmented_from(training.id));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/training/:trainingid', {
        name: 'Update Training',
        group: 'Training',
        description: 'Update an existing training',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        body: Type.Object({
            title: Type.Optional(Type.String()),
            body: Type.Optional(Type.String()),
            required: Type.Optional(Type.Boolean()),
            start_ts: Type.Optional(Type.String()),
            end_ts: Type.Optional(Type.String()),
            location: Type.Optional(Type.String()),
            location_geom: Type.Optional(Type.Any()),
            teams: Type.Optional(Type.Array(Type.Integer()))
        }),
        res: TrainingResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const teams = req.body.teams;
            delete req.body.teams;

            await config.models.Training.commit(req.params.trainingid, req.body);

            if (teams) {
                await config.models.TrainingTeam.delete(sql`training_id = ${req.params.trainingid}`)

                for (const a of teams) {
                    await config.models.TrainingTeam.generate({
                        training_id: req.params.trainingid,
                        team_id: a
                    });
                }
            }

            return res.json(await config.models.Training.augmented_from(req.params.trainingid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/training/:trainingid', {
        name: 'Delete Training',
        group: 'Training',
        description: 'Remove an existing training',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Admin');

            await config.models.Training.delete(req.params.trainingid);

            return res.json({
                status: 200,
                message: 'Training Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
