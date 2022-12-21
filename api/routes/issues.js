import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';
import IssueAssigned from '../lib/types/issue-assigned.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/issue', {
        name: 'Get Issues',
        group: 'Issue',
        auth: 'user',
        description: 'Get all issues for the Org',
        query: 'req.query.ListIssues.json',
        res: 'res.ListIssues.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
            await Auth.is_auth(req);

            const issue = await Issue.generate(config.pool, {
                author: req.auth.id,
                title: req.body.title,
                body: req.body.body
            });

            if (req.body.assigned) {
                for (const uid of req.body.assigned) {
                    IssueAssigned.generate(config.pool, {
                        issue_id: issue.id,
                        uid: uid
                    });
                }
            }

            res.json(issue);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/issue/:issueid', {
        name: 'Upodate Issue',
        group: 'Issue',
        auth: 'user',
        description: 'Update an issue',
        ':issueid': 'integer',
        body: 'req.body.PatchIssue.json',
        res: 'issues.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const issue = await Issue.from(config.pool, req.params.issueid);

            if (req.auth.id !== issue.author && req.auth.access !== 'admin') {
                throw new Err(401, null, 'Cannot edit another\'s issue');
            }

            await issue.commit(req.body);

            return res.json(issue);
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
            await Auth.is_auth(req);

            res.json(await Issue.from(config.pool, req.params.issueid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
