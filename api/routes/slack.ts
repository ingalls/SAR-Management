import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import Slack from '../lib/slack.js';
import Err from '@openaddresses/batch-error';
import { sql } from 'drizzle-orm';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/slack/channels', {
        name: 'List Channels',
        group: 'Slack',
        description: 'List all Slack Channels',
        res: Type.Object({
            channels: Type.Array(Type.Object({
                id: Type.String(),
                name: Type.String(),
                num_members: Type.Optional(Type.Integer())
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const slack = await Slack.create(config);
            if (!slack) throw new Err(400, null, 'Slack is not configured');

            await slack.check();

            const list = await slack.client.conversations.list({
                types: 'public_channel,private_channel',
                exclude_archived: true,
                limit: 1000
            });

            if (!list.ok) throw new Err(500, null, 'Slack API Error');

            res.json({
                channels: list.channels?.map((c) => {
                    if (typeof c === 'string') {
                        return {
                            id: c,
                            name: 'Unknown'
                        }
                    } else {
                        return {
                            id: c.id || '',
                            name: c.name || 'Unknown',
                            num_members: c.num_members
                        }
                    }
                }) || []
            });

        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/slack/channels/:channelid/membership', {
        name: 'Channel Membership Audit',
        group: 'Slack',
        description: 'Compare Slack channel members with SAR team members for teams linked to this channel',
        params: Type.Object({
            channelid: Type.String()
        }),
        res: Type.Object({
            teams: Type.Array(Type.Object({
                id: Type.Integer(),
                name: Type.String()
            })),
            members: Type.Array(Type.Object({
                id: Type.String(),
                name: Type.String(),
                real_name: Type.String(),
                email: Type.Optional(Type.String()),
                is_bot: Type.Boolean(),
                user_id: Type.Optional(Type.Integer())
            })),
            should_not_be_present: Type.Array(Type.Object({
                slack_id: Type.String(),
                slack_name: Type.String(),
                slack_real_name: Type.String(),
                email: Type.Optional(Type.String())
            })),
            should_be_present: Type.Array(Type.Object({
                user_id: Type.Integer(),
                fname: Type.String(),
                lname: Type.String(),
                email: Type.String()
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const slack = await Slack.create(config);
            if (!slack) throw new Err(400, null, 'Slack is not configured');

            await slack.check();

            // Get all member IDs in the channel
            const memberIds: string[] = [];
            let cursor: string | undefined;
            do {
                const page = await slack.client.conversations.members({
                    channel: req.params.channelid,
                    limit: 1000,
                    cursor
                });
                if (!page.ok) throw new Err(500, null, 'Slack API Error');
                memberIds.push(...(page.members || []));
                cursor = page.response_metadata?.next_cursor;
            } while (cursor);

            // Get user info for all slack workspace users
            const slackUsers = await slack.getUsers();
            const memberMap = new Map(slackUsers.map(u => [u.id, u]));

            const members = memberIds.map(id => {
                const user = memberMap.get(id);
                return {
                    id,
                    name: user?.name || 'Unknown',
                    real_name: user?.real_name || 'Unknown',
                    email: user?.profile?.email,
                    is_bot: user?.is_bot || false
                };
            });

            // Find teams linked to this channel
            const channelMappings = await config.models.TeamChannel.list({
                limit: 1000,
                where: sql`channel_id = ${req.params.channelid}`
            });

            const teamIds: number[] = channelMappings.items.map((m: any) => m.team_id);

            if (!teamIds.length) {
                res.json({
                    teams: [],
                    members,
                    should_not_be_present: [],
                    should_be_present: []
                });
                return;
            }

            // Get team info
            const teams: { id: number, name: string }[] = [];
            for (const tid of teamIds) {
                try {
                    const team = await config.models.Team.augmented_from(tid);
                    teams.push({ id: team.id, name: team.name });
                } catch { /* skip deleted teams */ }
            }

            // Get all SAR users in the linked teams with their slack external IDs
            const sarUsers = await config.models.User.listExternal('slack::userid', {
                limit: 10000,
                where: sql`
                    EXISTS (
                        SELECT 1 FROM users_to_teams
                        WHERE users_to_teams.uid = users.id
                        AND users_to_teams.tid = ANY(ARRAY[${sql.raw(teamIds.join(','))}]::INT[])
                    )
                    AND disabled = false
                `
            });

            // Build a set of slack IDs that should be in the channel
            const expectedSlackIds = new Set<string>();
            const sarUserBySlackId = new Map<string, any>();
            const sarUsersWithoutSlack: any[] = [];

            for (const user of sarUsers.items as any[]) {
                if (user.external) {
                    expectedSlackIds.add(user.external);
                    sarUserBySlackId.set(user.external, user);
                } else {
                    // Try to find by email
                    const slackUser = slackUsers.find(su =>
                        su.profile?.email && user.email &&
                        su.profile.email.toLowerCase() === user.email.toLowerCase()
                    );
                    if (slackUser) {
                        expectedSlackIds.add(slackUser.id);
                        sarUserBySlackId.set(slackUser.id, user);
                    } else {
                        sarUsersWithoutSlack.push(user);
                    }
                }
            }

            const channelMemberIds = new Set(memberIds);

            // Members in channel but NOT in the team (shouldn't be there)
            const should_not_be_present = members
                .filter(m => !m.is_bot && !expectedSlackIds.has(m.id))
                .map(m => ({
                    slack_id: m.id,
                    slack_name: m.name,
                    slack_real_name: m.real_name,
                    email: m.email
                }));

            // SAR team members NOT in the channel (should be there)
            const should_be_present: { user_id: number, fname: string, lname: string, email: string }[] = [];

            for (const [slackId, sarUser] of sarUserBySlackId) {
                if (!channelMemberIds.has(slackId)) {
                    should_be_present.push({
                        user_id: sarUser.id,
                        fname: sarUser.fname,
                        lname: sarUser.lname,
                        email: sarUser.email
                    });
                }
            }

            // Also add users without slack IDs as missing
            for (const user of sarUsersWithoutSlack) {
                should_be_present.push({
                    user_id: user.id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email
                });
            }

            // Enrich members with SAR user_id when linked
            for (const member of members) {
                const sarUser = sarUserBySlackId.get(member.id);
                if (sarUser) member.user_id = sarUser.id;
            }

            res.json({
                teams,
                members,
                should_not_be_present,
                should_be_present
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/slack/channels/:channelid/sync', {
        name: 'Sync Channel Membership',
        group: 'Slack',
        description: 'Remove members that should not be present and invite members that should be present',
        params: Type.Object({
            channelid: Type.String()
        }),
        res: Type.Object({
            removed: Type.Array(Type.Object({
                slack_id: Type.String(),
                name: Type.String(),
                success: Type.Boolean(),
                error: Type.Optional(Type.String())
            })),
            invited: Type.Array(Type.Object({
                user_id: Type.Integer(),
                name: Type.String(),
                success: Type.Boolean(),
                error: Type.Optional(Type.String())
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const slack = await Slack.create(config);
            if (!slack) throw new Err(400, null, 'Slack is not configured');

            await slack.check();

            // Get all member IDs in the channel
            const memberIds: string[] = [];
            let cursor: string | undefined;
            do {
                const page = await slack.client.conversations.members({
                    channel: req.params.channelid,
                    limit: 1000,
                    cursor
                });
                if (!page.ok) throw new Err(500, null, 'Slack API Error');
                memberIds.push(...(page.members || []));
                cursor = page.response_metadata?.next_cursor;
            } while (cursor);

            const slackUsers = await slack.getUsers();
            const memberMap = new Map(slackUsers.map(u => [u.id, u]));

            // Find teams linked to this channel
            const channelMappings = await config.models.TeamChannel.list({
                limit: 1000,
                where: sql`channel_id = ${req.params.channelid}`
            });

            const teamIds: number[] = channelMappings.items.map((m: any) => m.team_id);
            if (!teamIds.length) throw new Err(400, null, 'Channel is not linked to any team');

            // Get all SAR users in linked teams with their slack external IDs
            const sarUsers = await config.models.User.listExternal('slack::userid', {
                limit: 10000,
                where: sql`
                    EXISTS (
                        SELECT 1 FROM users_to_teams
                        WHERE users_to_teams.uid = users.id
                        AND users_to_teams.tid = ANY(ARRAY[${sql.raw(teamIds.join(','))}]::INT[])
                    )
                    AND disabled = false
                `
            });

            // Build expected slack IDs
            const expectedSlackIds = new Set<string>();
            const sarUserBySlackId = new Map<string, any>();
            const sarUsersWithoutSlack: any[] = [];

            for (const user of sarUsers.items as any[]) {
                if (user.external) {
                    expectedSlackIds.add(user.external);
                    sarUserBySlackId.set(user.external, user);
                } else {
                    const slackUser = slackUsers.find(su =>
                        su.profile?.email && user.email &&
                        su.profile.email.toLowerCase() === user.email.toLowerCase()
                    );
                    if (slackUser) {
                        expectedSlackIds.add(slackUser.id);
                        sarUserBySlackId.set(slackUser.id, user);
                    } else {
                        sarUsersWithoutSlack.push(user);
                    }
                }
            }

            const channelMemberIds = new Set(memberIds);

            // Remove members that should not be present
            const toRemove = memberIds.filter(id => {
                const user = memberMap.get(id);
                return !user?.is_bot && !expectedSlackIds.has(id);
            });

            const removed: { slack_id: string, name: string, success: boolean, error?: string }[] = [];
            for (const slackId of toRemove) {
                const user = memberMap.get(slackId);
                try {
                    await slack.client.conversations.kick({
                        channel: req.params.channelid,
                        user: slackId
                    });
                    removed.push({ slack_id: slackId, name: user?.real_name || 'Unknown', success: true });
                } catch (err: any) {
                    removed.push({ slack_id: slackId, name: user?.real_name || 'Unknown', success: false, error: err.data?.error || err.message });
                }
            }

            // Invite members that should be present
            const toInvite: { slackId: string, sarUser: any }[] = [];
            for (const [slackId, sarUser] of sarUserBySlackId) {
                if (!channelMemberIds.has(slackId)) {
                    toInvite.push({ slackId, sarUser });
                }
            }

            const invited: { user_id: number, name: string, success: boolean, error?: string }[] = [];
            for (const { slackId, sarUser } of toInvite) {
                try {
                    await slack.client.conversations.invite({
                        channel: req.params.channelid,
                        users: slackId
                    });
                    invited.push({ user_id: sarUser.id, name: `${sarUser.fname} ${sarUser.lname}`, success: true });
                } catch (err: any) {
                    invited.push({ user_id: sarUser.id, name: `${sarUser.fname} ${sarUser.lname}`, success: false, error: err.data?.error || err.message });
                }
            }

            // Also note users without slack IDs that couldn't be invited
            for (const user of sarUsersWithoutSlack) {
                invited.push({ user_id: user.id, name: `${user.fname} ${user.lname}`, success: false, error: 'No linked Slack account' });
            }

            res.json({ removed, invited });
        } catch (err) {
            Err.respond(err, res);
        }
    });

}
