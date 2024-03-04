import Err from '@openaddresses/batch-error';
import TeamFieldability from '../lib/types/team-fieldability.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/team/:teamid/fieldability', {
        name: 'List Fieldability',
        group: 'Teams',
        auth: 'user',
        params: Type.Object({
            teamid: Type.Integer(),
        }),
        description: 'Return fieldability settings for a team',
        res: 'fieldability.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Team:View');

            res.json(await TeamFieldability.list(config.pool, req.params.teamid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
