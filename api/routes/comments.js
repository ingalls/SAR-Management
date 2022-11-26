import Err from '@openaddresses/batch-error';
import IssueComment from '../lib/types/issue-comment.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/issue/:issueid/comment', {
        name: 'Get Comments',
        group: 'Comments',
        auth: 'user',
        description: 'Get all comments for a given issue',
        ':issueid': 'integer',
        req: 'req.query.ListIssueComments.json',
        res: 'res.ListIssueComments.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await IssueComment.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/comment', {
        name: 'Create Comment',
        group: 'Comments',
        auth: 'user',
        ':issueid': 'integer',
        description: 'Create a new issue comment',
        body: 'req.body.CreateIssueComment.json',
        res: 'issues_comments.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Issuecomment.generate(config.pool, {
                author: req.auth.id,
                ...req.body
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
