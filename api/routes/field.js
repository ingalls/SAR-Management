import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';

export default async function router(schema, config) {
    await schema.get('/issue', {
        name: 'Get Issues',
        group: 'Issue',
        auth: 'user',
        description: 'Get all issues for the Org',
        req: 'req.query.ListIssues.json',
        res: 'res.ListIssues.json'
    }, async (req, res) => {
        try {
            res.json(await Issue.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
