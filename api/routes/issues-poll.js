import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';
import Poll from '../lib/types/poll.js';
import PollQuestion from '../lib/types/poll-question.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/issue/:issueid/poll', {
        name: 'Get Poll',
        group: 'IssuePoll',
        auth: 'user',
        ':issueid': 'integer',
        description: 'Get a poll for a given issue',
        res: 'res.Poll.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            const issue = await Issue.from(config.pool, req.params.issueid);

            if (!issue.poll_id) throw new Err(400, null, 'Issue does not have a poll');

            const poll = await Poll.from(config.pool, issue.poll_id);

            return res.json(poll);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
