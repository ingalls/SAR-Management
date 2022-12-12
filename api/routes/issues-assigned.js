import Err from '@openaddresses/batch-error';
import IssueAssigned from '../lib/types/issue-assigned.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/issue/:issueid/assigned', {
        name: 'Get Assigned',
        group: 'IssueAssigned',
        auth: 'user',
        ':issueid': 'integer',
        description: 'Get users assigned to an issue',
        res: 'res.ListIssueAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await IssueAssigned.list(config.pool, req.params.issueid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
