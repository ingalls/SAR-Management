import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';
import Auth from '../lib/auth.js';

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
            Auth.is_auth(req);

            res.json(await Issue.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue', {
        name: 'Create Issue',
        group: 'Issue',
        auth: 'user',
        description: 'Create a new issue',
        body: 'req.body.CreateIssue.json',
        res: 'issues.json'
    }, async (req, res) => {
        try {
            Auth.is_auth(req);

            res.json(await Issue.generate(config.pool, {
                author: req.auth.id,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/issue/:issueid', {
        name: 'Get Issue',
        group: 'Issue',
        auth: 'user',
        ':issueid': 'integer',
        description: 'Get an issue',
        res: 'issues.json'
    }, async (req, res) => {
        try {
            Auth.is_auth(req);

            res.json(await Issue.from(config.pool, req.params.issueid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
