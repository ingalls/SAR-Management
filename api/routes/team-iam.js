import Err from '@openaddresses/batch-error';
import IAM from '../lib/types/iam.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/team/:teamid/iam', {
        name: 'Get IAM',
        group: 'IAM',
        auth: 'user',
        description: 'Get IAM settings for a given team',
        ':teamid': 'integer',
        req: 'req.query.ListTeamIAM.json',
        res: 'res.ListTeamIAM.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json([{
                id: 1,
                team_id: 1,
                groupref: 'Teams',
                resource: 'Get*',
                action: 'Allow'
            }]);
            //res.json(await IAM.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
