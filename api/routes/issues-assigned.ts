import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm'
import Auth, { PermissionsLevel, IamGroup } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, IssueAssignedResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/issue/:issueid/assigned', {
        name: 'Get Assigned',
        group: 'IssueAssigned',
        params: Type.Object({
            issueid: Type.Integer()
        }),
        description: 'Get users assigned to an issue',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(IssueAssignedResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.View);

            res.json(await config.models.IssueAssigned.augmented_list({
                where: sql`
                    issue_id = ${req.params.issueid}
                `
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/issue/:issueid/assigned', {
        name: 'Add Assigned',
        group: 'IssueAssigned',
        params: Type.Object({
            issueid: Type.Integer()
        }),
        description: 'Remove an assignment',
        body: Type.Object({
            uid: Type.Integer()
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.Manage);

            await config.models.IssueAssigned.generate({
                issue_id: req.params.issueid,
                uid: req.body.uid
            });

            res.json({
                status: 200,
                message: 'User Assigned'
            })
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.delete('/issue/:issueid/assigned/:assignedid', {
        name: 'Remove Assigned',
        group: 'IssueAssigned',
        params: Type.Object({
            issueid: Type.Integer(),
            assignedid: Type.Integer()
        }),
        description: 'Remove a user from an issue',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Issue, PermissionsLevel.Manage);

            const issue = await config.models.Issue.from(req.params.issueid);
            const assigned = await config.models.IssueAssigned.from(req.params.assignedid)
            if (assigned.issue_id !== issue.id) throw new Err(400, null, 'Assigned User does not belong to the Issue');

            await config.models.IssueAssigned.delete(req.params.assignedid);

            res.json({
                status: 200,
                message: 'Assignment Removed'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
