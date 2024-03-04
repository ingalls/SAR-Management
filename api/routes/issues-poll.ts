import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';
import Poll from '../lib/types/poll.js';
import PollVote from '../lib/types/poll-vote.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/poll', {
        name: 'Get Poll',
        group: 'IssuePoll',
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Get a poll for a given issue',
        res: 'res.Poll.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            const issue = await Issue.from(config.pool, req.params.issueid);

            if (!issue.poll_id) throw new Err(400, null, 'Issue does not have a poll');

            const poll = await Poll.from(config.pool, issue.poll_id);

            let vote;
            try {
                vote = await PollVote.from(config.pool, req.auth.id, poll.id);
            } catch (err) {
                vote = null;
            }

            return res.json({
                ...poll.serialize(),
                questions: poll.questions,
                vote: vote ? vote.question_id : null,
                votes: poll.votes
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/poll', {
        name: 'Vote Poll',
        group: 'IssuePoll',
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Cast a vote in a poll',
        body: 'req.body.CreatePollVote.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            const issue = await Issue.from(config.pool, req.params.issueid);
            if (!issue.poll_id) throw new Err(400, null, 'Issue does not have a poll');

            const poll = await Poll.from(config.pool, issue.poll_id);
            const questions = poll.questions.map((question) => question.id);
            if (!questions.includes(req.body.question)) throw new Err(400, null, 'Question does not belong to this poll');

            await PollVote.generate(config.pool, {
                uid: req.auth.id,
                poll_id: poll.id,
                question_id: req.body.question
            });

            return res.json({
                status: 200,
                message: 'Vote Cast'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
