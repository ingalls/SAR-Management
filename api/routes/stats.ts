import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/stats/mission', {
        name: 'Get Mission Stats',
        group: 'Stats',
        description: 'Get Mission Stats',
        query: Type.Object({
            start: Type.String(),
            end: Type.String()
        }),
        res: Type.Object({
            count: Type.Integer(),
            hours: Type.Integer(),
            longest_mission: Type.Optional(Type.Object({
                id: Type.Integer(),
                name: Type.String(),
                hours: Type.Integer()
            })),
            average: Type.Integer()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Statistics, PermissionsLevel.VIEW);

            res.json(await config.models.Stats.mission(req.query.start, req.query.end));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/stats/training', {
        name: 'Get Training Stats',
        group: 'Stats',
        description: 'Get Training Stats',
        query: Type.Object({
            start: Type.String(),
            end: Type.String()
        }),
        res: Type.Object({
            count: Type.Integer(),
            hours: Type.Integer()
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Statistics, PermissionsLevel.VIEW);

            res.json(await config.models.Stats.training(req.query.start, req.query.end));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
