import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, TrainingAssignedResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/training/:trainingid/assigned', {
        name: 'Get Assigned',
        group: 'TrainingAssigned',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Get users assigned to a training',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(TrainingAssignedResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:View');

            res.json(await config.models.TrainingAssigned.augmented_list({
                where: sql`training_id = ${req.params.trainingid}`
            }))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training/:trainingid/assigned', {
        name: 'Add Assigned',
        group: 'TrainingAssigned',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Create an assignment',
        body: Type.Object({
            uid: Type.Integer(),
            confirmed: Type.Boolean({ default: true }),
            role: Type.String({ default: 'Present' })
        }),
        res: TrainingAssignedResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const assigned = await config.models.TrainingAssigned.generate({
                training_id: req.params.trainingid,
                ...req.body
            });

            return res.json(await config.models.TrainingAssigned.augmented_from(assigned.id))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/training/:trainingid/assigned/request', {
        name: 'Request Assignment',
        group: 'TrainingAssigned',
        params: Type.Object({
            trainingid: Type.Integer(),
        }),
        description: 'Request an assignment',
        res: TrainingAssignedResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, 'Training:View');

            const assigned = await config.models.TrainingAssigned.generate({
                training_id: req.params.trainingid,
                uid: user.id,
                role: 'Present',
                confirmed: false
            });

            return res.json(await config.models.TrainingAssigned.augmented_from(assigned.id))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/training/:trainingid/assigned/:assignedid', {
        name: 'Update Assigned',
        group: 'TrainingAssigned',
        params: Type.Object({
            trainingid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Update a user in a training',
        body: Type.Object({
            confirmed: Type.Boolean(),
            role: Type.String()
        }),
        res: TrainingAssignedResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const training = await config.models.Training.from(req.params.trainingid);
            const assigned = await config.models.TrainingAssigned.from(req.params.assignedid);
            if (assigned.training_id !== training.id) throw new Err(400, null, 'Assigned User does not belong to the Training');

            await config.models.TrainingAssigned.commit(req.params.trainingid, req.body);

            return res.json(await config.models.TrainingAssigned.augmented_from(assigned.id))
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/training/:trainingid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'TrainingAssigned',
        params: Type.Object({
            trainingid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Remove a user from a training',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Training:Manage');

            const training = await config.models.Training.from(req.params.trainingid);
            const assigned = await config.models.TrainingAssigned.from(req.params.assignedid);
            if (assigned.training_id !== training.id) throw new Err(400, null, 'Assigned User does not belong to the Training');

            await config.models.TrainingAssigned.delete(req.params.trainingid);

            return res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
