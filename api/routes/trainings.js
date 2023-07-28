import Err from '@openaddresses/batch-error';
import Training from '../lib/types/training.js';
import TrainingView from '../lib/views/training.js';
import TrainingAssigned from '../lib/types/training-assigned.js';
import TrainingTeam from '../lib/types/training-team.js';
import Auth from '../lib/auth.js';
import moment from 'moment';

export default async function router(schema, config) {
    await schema.get('/training', {
        name: 'List Trainings',
        group: 'Training',
        auth: 'user',
        description: 'Get all trainings for the Org',
        query: 'req.query.ListTrainings.json',
        res: 'res.ListTrainings.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Training:View');

            const list = await TrainingView.list(config.pool, req.query);

            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/training/:trainingid', {
        name: 'Get Training',
        group: 'Training',
        auth: 'user',
        description: 'Get a single Training',
        ':trainingid': 'integer',
        res: 'res.Training.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Training:View');

            res.json(await TrainingView.from(config.pool, req.params.trainingid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training', {
        name: 'Create Training',
        group: 'Training',
        auth: 'user',
        description: 'Create a new training',
        body: 'req.body.CreateTraining.json',
        res: 'training.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Training:Manage');

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const teams = req.body.teams;
            delete req.body.teams;

            const training = await Training.generate(config.pool, {
                ...req.body,
                author: req.auth.id
            });

            if (assigned) {
                for (const a of assigned) {
                    await TrainingAssigned.generate(config.pool, {
                        training_id: training.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: a.uid
                    });
                }
            }

            if (teams) {
                for (const a of teams) {
                    await TrainingTeam.generate(config.pool, {
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
        auth: 'user',
        description: 'Update an existing training',
        ':trainingid': 'integer',
        body: 'req.body.PatchTraining.json',
        res: 'training.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Training:Manage');

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts;

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts;

            const teams = req.body.teams;
            delete req.body.teams;

            const training = await Training.from(config.pool, req.params.trainingid);

            await training.commit(req.body);

            if (teams) {
                await TrainingTeam.delete(config.pool, training.id, {
                    column: 'training_id'
                });

                for (const a of teams) {
                    await TrainingTeam.generate(config.pool, {
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
        auth: 'user',
        description: 'Remove an existing training',
        ':trainingid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Training:Admin');

            const training = await Training.from(config.pool, req.params.trainingid);
            await training.delete();

            return res.json({
                status: 200,
                message: 'Training Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
