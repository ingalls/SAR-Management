import Err from '@openaddresses/batch-error';
import TeamFieldability from '../lib/types/team-fieldability.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/team/:teamid/fieldability', {
        name: 'List Fieldability',
        group: 'Teams',
        auth: 'user',
        ':teamid': 'integer',
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
