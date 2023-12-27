import Err from '@openaddresses/batch-error';
import Issue from '../lib/types/issue.js';
import Poll from '../lib/types/poll.js';
import PollQuestion from '../lib/types/poll-question.js';
import ViewIssue from '../lib/views/issue.js';
import IssueAssigned from '../lib/types/issue-assigned.js';
import Auth from '../lib/auth.js';
import { stringify } from '../node_modules/csv-stringify/lib/sync.js';
import Notify from '../lib/notify.js';

export default async function router(schema, config) {
    const notify = new Notify(config);

    await schema.get('/issue', {
        name: 'Get Issues',
        group: 'Issue',
        auth: 'user',
        description: 'Get all issues for the Org',
        query: 'req.query.ListIssues.json',
        res: 'res.ListIssues.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            if (['csv'].includes(req.query.format)) {
                if (req.query.format === 'csv') {
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', 'attachment; filename="sar-issues.csv"');
                    res.write(stringify([req.query.fields]));
                }

                (await ViewIssue.stream(config.pool, req.query)).on('data', async (issue) => {
                    if (req.query.format === 'csv') {
                        const line = [];
                        for (const field of req.query.fields) {
                            line.push(issue[field] === undefined ? '' : issue[field]);
                        }
                        res.write(stringify([line]));
                    }
                }).on('end', () => {
                    res.end();
                });
            } else {
                res.json(await ViewIssue.list(config.pool, req.query));
            }
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
        res: 'view_issues.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const assigned = req.body.assigned;
            delete req.body.assigned;
            const poll = req.body.poll;
            delete req.body.poll;

            const issue = await Issue.generate(config.pool, {
                ...req.body,
                author: req.auth.id
            });

            if (poll) {
                const p = await Poll.generate(config.pool, {
                    expiry: poll.expiry
                });

                for (const question of poll.questions) {
                    await PollQuestion.generate(config.pool, { poll_id: p.id, question });
                }

                await issue.commit({ poll_id: p.id });
            }

            if (assigned) {
                for (const uid of assigned) {
                    IssueAssigned.generate(config.pool, {
                        issue_id: issue.id,
                        uid: uid
                    });
                }
            }

            res.json(await ViewIssue.from(config.pool, issue.id));
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
        res: 'view_issues.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:Manage');

            const issue = await Issue.from(config.pool, req.params.issueid);

            if (req.auth.id !== issue.author && req.auth.access !== 'admin') {
                if (req.body.status !== undefined) {
                    await issue.commit({
                        status: req.body.status
                    });
                } else {
                    throw new Err(401, null, 'Cannot edit another\'s issue');
                }
            } else {
                await issue.commit(req.body);
            }

            res.json(await ViewIssue.from(config.pool, issue.id));
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
        res: 'view_issues.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Issue:View');

            res.json(await ViewIssue.from(config.pool, req.params.issueid));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
