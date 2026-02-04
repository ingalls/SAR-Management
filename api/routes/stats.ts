import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/stats', {
        name: 'Get Stats',
        group: 'Stats',
        description: 'Get System Stats',
        query: Type.Object({
            start: Type.String(),
            end: Type.String()
        }),
        res: Type.Object({
            missions: Type.Integer(),
            trainings: Type.Integer()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Statistics, PermissionsLevel.VIEW);
            
            res.json(await config.models.Stats.generate(req.query.start, req.query.end));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
