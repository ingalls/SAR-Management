import Err from '@openaddresses/batch-error';
import IssueAssigned from '../lib/types/issue-assigned.js';
import Issue from '../lib/types/issue.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/assigned', {
        name: 'Get Assigned',
        group: 'IssueAssigned',
        auth: 'user',
        params: Type.Object({
            issueid: Type.String()
        }),
        description: 'Get users assigned to an issue',
        res: 'res.ListIssueAssigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:View');

            res.json(await IssueAssigned.list(config.pool, req.params.issueid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/assigned', {
        name: 'Add Assigned',
        group: 'IssueAssigned',
        auth: 'user',
        params: Type.Object({
            issueid: Type.String()
        }),
        description: 'Remove an assignment',
        body: 'req.body.CreateIssueAssigned.json',
        res: 'issues_assigned.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:Manage');

            res.json(await IssueAssigned.generate(config.pool, {
                issue_id: req.params.issueid,
                uid: req.body.uid
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/issue/:issueid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'IssueAssigned',
        auth: 'user',
        params: Type.Object({
            issueid: Type.Integer()
            assignedid: Type.Integer()
        }),
        description: 'Remove a user from an issue',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'Issue:Manage');

            const issue = await Issue.from(config.pool, req.params.issueid);
            const assigned = await IssueAssigned.from(config.pool, req.params.assignedid);
            if (assigned.issue_id !== issue.id) throw new Error(400, null, 'Assigned User does not belong to the Issue');

            await assigned.delete();

            return res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
