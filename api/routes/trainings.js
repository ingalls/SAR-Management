import Err from '@openaddresses/batch-error';
import Training from '../lib/types/training.js';
import TrainingAssigned from '../lib/types/training-assigned.js';
import Auth from '../lib/auth.js';
import moment from 'moment';

export default async function router(schema, config) {
    await schema.get('/training', {
        name: 'List Trainings',
        group: 'Training',
        auth: 'user',
        description: 'Get all trainings for the Org',
        req: 'req.query.ListTrainings.json',
        res: 'res.ListTrainings.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Training.list(config.pool, req.query));
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
        res: 'training.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Training.from(config.pool, req.params.trainingid));
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
            await Auth.is_auth(req);

            // TODO: Generic should handle this
            if (req.body.start_ts) req.body.start_ts = moment(req.body.start_ts).unix() * 1000;
            else delete req.body.start_ts

            if (req.body.end_ts) req.body.end_ts = moment(req.body.end_ts).unix() * 1000;
            else delete req.body.end_ts

            res.json(await Training.generate(config.pool, {
                title: req.body.title,
                body: req.body.body,
                start_ts: req.body.start_ts,
                end_ts: req.body.end_ts,
                author: req.auth.id,
            }));

            if (req.body.assigned) {
                for (const a of req.body.assigned) {
                    TrainingAssigned.generate(config.pool, {
                        training_id: training.id,
                        role: a.role,
                        confirmed: a.confirmed,
                        uid: uid
                    });
                }
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
