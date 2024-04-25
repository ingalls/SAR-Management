import Err from '@openaddresses/batch-error';
import { sql } from 'drizzl-orm';
import Training from '../lib/types/training.js';
import TrainingView from '../lib/views/training.js';
import TrainingAssigned from '../lib/types/training-assigned.js';
import TrainingTeam from '../lib/types/training-team.js';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import moment from 'moment';
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
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Mission)})),
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
                    AND (${req.query.assigned}::BIGINT IS NULL OR users @> ARRAY[${req.query.assigned}::BIGINT])
                    AND (${req.query.team}::BIGINT IS NULL OR teams_id @> ARRAY[${req.query.team}::BIGINT])
                    AND (${req.query.required}::BOOLEAN IS NULL OR required = ${req.query.required})
                    AND (${req.query.start}::TIMESTAMP IS NULL OR start_ts >= ${req.query.start}::TIMESTAMP)
                    AND (${req.query.end}::TIMESTAMP IS NULL OR end_ts <= ${req.query.end}::TIMESTAMP)
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

            const training = await TrainingView.from(config.pool, req.params.trainingid);
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
        body: 'req.body.CreateTraining.json',
        res: TrainingResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;
            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;

            const training = await config.models.Training.generate({
                ...req.body,
                author: req.auth.id
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

            return res.json(training);
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
        body: 'req.body.PatchTraining.json',
        res: TrainingResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const teams = req.body.teams;
            delete req.body.teams;

            await config.models.Training.commit(req.params.trainingid, req.body);

            if (teams) {
                await config.models.TrainingTeam.delete(sql`training_id = ${training.id}`)

                for (const a of teams) {
                    await config.models.TrainingTeam.generate({
                        training_id: training.id,
                        team_id: a
                    });
                }
            }

            return res.json(training);
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
