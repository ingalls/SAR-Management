import Err from '@openaddresses/batch-error';
import TrainingAssigned from '../lib/types/training-assigned.js';
import Training from '../lib/types/training.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/training/:trainingid/assigned', {
        name: 'Get Assigned',
        group: 'TrainingAssigned',
        auth: 'user',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Get users assigned to a training',
        res: 'res.ListTrainingAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:View');

            res.json(await TrainingAssigned.list(config.pool, req.params.trainingid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training/:trainingid/assigned', {
        name: 'Add Assigned',
        group: 'TrainingAssigned',
        auth: 'user',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Create an assignment',
        body: 'req.body.CreateTrainingAssigned.json',
        res: 'training_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            res.json(await TrainingAssigned.generate(config.pool, {
                training_id: req.params.trainingid,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training/:trainingid/assigned/request', {
        name: 'Request Assignment',
        group: 'TrainingAssigned',
        auth: 'user',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Request an assignment',
        res: 'training_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:View');

            res.json(await TrainingAssigned.generate(config.pool, {
                training_id: req.params.trainingid,
                uid: req.auth.id,
                role: 'Present',
                confirmed: false
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/training/:trainingid/assigned/:assignedid', {
        name: 'Update Assigned',
        group: 'TrainingAssigned',
        auth: 'user',
        params: Type.Object({
            trainingid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Update a user in a training',
        body: 'req.body.PatchTrainingAssigned.json',
        res: 'training_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const training = await Training.from(config.pool, req.params.trainingid);
            const assigned = await TrainingAssigned.from(config.pool, req.params.assignedid);
            if (assigned.training_id !== training.id) throw new Err(400, null, 'Assigned User does not belong to the Training');

            await assigned.commit(req.body);

            return res.json(assigned);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/training/:trainingid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'TrainingAssigned',
        auth: 'user',
        params: Type.Object({
            trainingid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Remove a user from a training',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const training = await Training.from(config.pool, req.params.trainingid);
            const assigned = await TrainingAssigned.from(config.pool, req.params.assignedid);
            if (assigned.training_id !== training.id) throw new Err(400, null, 'Assigned User does not belong to the Training');

            await assigned.delete();

            return res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}