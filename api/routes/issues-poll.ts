import Err from '@openaddresses/batch-error';
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, PollResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/poll', {
        name: 'Get Poll',
        group: 'IssuePoll',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Get a poll for a given issue',
        res: PollResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            const issue = await config.models.Issue.from(req.params.issueid);

            if (!issue.poll_id) throw new Err(400, null, 'Issue does not have a poll');

            const poll = await config.models.Poll.augmented_from(issue.poll_id);

            let vote;
            try {
                vote = await config.models.PollVote.from(sql`
                    uid = ${user.id}
                    AND poll_id = ${poll.id}
                `);
            } catch (err) {
                console.error(err);
                vote = null;
            }

            res.json({
                ...poll,
                vote: vote.question_id
            })
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/poll', {
        name: 'Vote Poll',
        group: 'IssuePoll',
        params: Type.Object({
            issueid: Type.Integer(),
        }),
        description: 'Cast a vote in a poll',
        body: Type.Object({
            question: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.VIEW);

            const issue = await config.models.Issue.from(req.params.issueid);
            if (!issue.poll_id) throw new Err(400, null, 'Issue does not have a poll');

            const poll = await config.models.Poll.from(issue.poll_id);
            const question = await config.models.PollQuestion.from(req.body.question);
            if (question.poll_id !== poll.id) throw new Err(400, null, 'Question does not belong to this poll');

            await config.models.PollVote.generate({
                uid: user.id,
                poll_id: poll.id,
                question_id: req.body.question
            });

            res.json({
                status: 200,
                message: 'Vote Cast'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
