import { WebClient } from '@slack/web-api';
import Config from './config.js';
import { PromisePool } from '@supercharge/promise-pool';
import { sql } from 'drizzle-orm';
import Err from '@openaddresses/batch-error';

export interface SlackUser {
    id: string;
    deleted: boolean;
    is_bot: boolean;
    name: string;
    real_name: string;
    profile: {
        email: string;
    }
}

export default class Slack {
    client: WebClient;
    config: Config;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    expiry?: number;

    constructor(token: string, config: Config, opts: { refreshToken?: string, clientId?: string, clientSecret?: string, expiry?: number } = {}) {
        this.client = new WebClient(token);
        this.config = config;
        this.refreshToken = opts.refreshToken;
        this.clientId = opts.clientId;
        this.clientSecret = opts.clientSecret;
        this.expiry = opts.expiry;
    }

    static async create(config: Config): Promise<Slack | undefined> {
        try {
            const enabled = (await config.models.Server.from('slack_enabled')).value ? true : false;
            if (!enabled) return;
        } catch {
            return;
        }

        let token;
        try {
            token = (await config.models.Server.from('slack_token')).value;
        } catch {
            return;
        }

        let refreshToken, clientId, clientSecret, expiry;
        try { refreshToken = (await config.models.Server.from('slack_refresh')).value; } catch { /* empty */ }
        try { clientId = (await config.models.Server.from('slack_client_id')).value; } catch { /* empty */ }
        if (!clientId) {
            try { clientId = (await config.models.Server.from('slack_app_id')).value; } catch { /* empty */ }
        }
        try { clientSecret = (await config.models.Server.from('slack_client_secret')).value; } catch { /* empty */ }
        try { expiry = parseInt((await config.models.Server.from('slack_token_expiry')).value); } catch { /* empty */ }

        return new Slack(token, config, { refreshToken, clientId, clientSecret, expiry });
    }

    async refresh(): Promise<string> {
        if (!this.refreshToken || !this.clientId || !this.clientSecret) {
            throw new Error('Slack: Missing refresh token or client credentials');
        }

        const res = await this.client.oauth.v2.access({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken
        });

        if (!res.ok || !res.access_token) {
            throw new Error(`Slack: Failed to refresh token: ${res.error}`);
        }

        if (res.refresh_token) {
            this.refreshToken = res.refresh_token;
            await this.config.models.Server.commit('slack_refresh', { value: this.refreshToken });
        }

        if (res.expires_in) {
            this.expiry = Date.now() + (res.expires_in * 1000);
            await this.config.models.Server.commit('slack_token_expiry', { value: String(this.expiry) });
        }

        const token = res.access_token;
        this.client = new WebClient(token);
        await this.config.models.Server.commit('slack_token', { value: token });

        return token;
    }

    async check(): Promise<void> {
        if (this.expiry && Date.now() > this.expiry - 60000) {
            await this.refresh();
        }
    }

    async getUser(email: string) {
        await this.check();

        const res = await this.client.users.lookupByEmail({ email });
        if (!res.ok || !res.user) throw new Error(`Slack: Failed to lookup user ${email}`);

        return res.user;
    }

    async getUsers(): Promise<SlackUser[]> {
        await this.check();
        const users: SlackUser[] = [];
        for await (const page of this.client.paginate('users.list', { limit: 1000 })) {
            // Check if page (or page['members']) is iterable, depends on how client.paginate yields
            const members = (page as any).members || []; 
            users.push(...members as SlackUser[]);
        }
        return users;
    }

    async getUserGroup(name: string) {
        await this.check();

        let handle = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (handle.length > 20) handle = handle.substring(0, 20);
        handle = handle.replace(/-+$/, '');

        try {
            const groups = await this.client.usergroups.list({
                include_disabled: false
            });

            let group = groups.usergroups?.find(g => g.handle === handle || g.name === name);

            if (!group) {
                const res = await this.client.usergroups.create({ name, handle });
                group = res.usergroup;
            } else if ((group as any).date_delete) {
                const res = await this.client.usergroups.enable({ usergroup: group.id! });
                group = res.usergroup;
            }

            return group;
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            if (err.data?.error === 'permission_denied') {
                throw new Error('Permission denied. Slack User Group management requires a User Token (xoxp-) from a Workspace Admin. Bot tokens are often restricted.');
            }
            throw err;
        }
    }

    async userGroupSync(team_id: number): Promise<{ errors: string[] }> {
        const errors: string[] = [];
        await this.check();

        const enabled = (await this.config.models.TeamSetting.typed(team_id, 'slack::usergroup::enabled', false)).value;
        if (!enabled) throw new Err(400, null, 'Slack User Group Sync is disabled for this team');

        const groupName = (await this.config.models.TeamSetting.typed(team_id, 'slack::usergroup::name', '')).value;
        if (!groupName) throw new Err(400, null, 'Slack User Group Name not configured');

        const mappings = await this.config.models.TeamChannel.list({
            where: sql`team_id = ${team_id}`
        });

        if (!mappings.total) {
            console.warn(`Slack: No channel mappings found for team ${team_id} - skipping sync`);
            return { errors };
        }

        const users = await this.config.models.User.listExternal('slack::userid', {
            limit: 1000,
            where: sql`
                EXISTS (
                    SELECT 1 FROM users_to_teams
                    WHERE users_to_teams.uid = users.id
                    AND users_to_teams.tid = ${team_id}
                )
                AND disabled = false
            `
        });

        const { results } = await PromisePool
            .withConcurrency(10)
            .for(users.items)
            .process(async (user: any) => {
                if (!user.email) return null;
                try {
                    if (user.external) return user.external;

                    const slackUser = await this.getUser(user.email);
                    if (!slackUser.id) return null;

                    await this.config.models.User.addExternal(user.id, 'slack::userid', slackUser.id);

                    return slackUser.id;
                } catch (err) {
                    console.error(JSON.stringify(err, null, 2));
                    return null;
                }
            });

        const teamSlackIds = results.filter((id) => id !== null && id !== undefined) as string[];

        if (teamSlackIds.length === 0) {
            console.warn(`Slack: No valid Slack users found for team ${team_id} - skipping sync`);
            return { errors };
        }

        const group = await this.getUserGroup(groupName);

        if (!group) {
            errors.push('Failed to find or create Slack User Group');
            return { errors };
        }

        try {
            const channelIds = mappings.items.map((m: any) => m.channel_id);
            if (channelIds.length) {
                await this.client.usergroups.update({
                    usergroup: group.id!,
                    channels: channelIds.join(',')
                });
            }
        } catch (err: any) {
            errors.push(`Slack: Failed to sync default channels to group - ${err.message || err}`);
        }

        try {
            const currentMembers = await this.client.usergroups.users.list({ usergroup: group.id! });
            if (currentMembers.ok && currentMembers.users) {
                const currentSet = new Set(currentMembers.users);

                // Add users not in group
                const toAdd = teamSlackIds.filter(id => !currentSet.has(id));
                if (toAdd.length > 0) {
                     await this.client.usergroups.users.update({
                        usergroup: group.id!,
                        users: teamSlackIds.join(',')
                        // Note: update replaces the list, which acts as add+remove.
                        // If we want to only add, this API is tricky.
                        // But usually sync implies "make it match".
                     });
                } else if (currentMembers.users.length !== teamSlackIds.length && teamSlackIds.length > 0) {
                     // If no one to add but lengths differ, it means we need to remove someone?
                     // Verify if "update" is safe. Docs say: "The list of users to be in the user group."
                     // So we should just send the full list of desired users.
                     await this.client.usergroups.users.update({
                        usergroup: group.id!,
                        users: teamSlackIds.join(',')
                     });
                }
            } else {
                 // No current members or failed to list, try setting list
                 if (teamSlackIds.length > 0) {
                    await this.client.usergroups.users.update({
                        usergroup: group.id!,
                        users: teamSlackIds.join(',')
                    });
                 }
            }

        } catch (err: any) {
             const msg = `Slack: Failed to sync users to Group ${groupName}`;
             console.error(msg, JSON.stringify(err, null, 2));

             if (err.data && err.data.error === 'permission_denied') {
                 errors.push(`${msg} - Permission denied. Ensure your Slack Token is a User Token (xoxp-) from an Admin/Owner, as Bot tokens cannot manage User Groups.`);
             } else if (err.data && err.data.error) {
                errors.push(`${msg} - ${err.data.error}`);
             } else if (err.message) {
                errors.push(`${msg} - ${err.message}`);
             } else {
                errors.push(msg);
             }
        }

        return { errors };
    }

    async postMessage(channel: string, text: string): Promise<void> {
        await this.check();

        if (!this.client.token) {
            console.error('Slack token not configured - cannot send message');
            return;
        }

        try {
            await this.client.chat.postMessage({
                channel: channel,
                text: text
            });
        } catch (err) {
            const error = err as { code?: string, data?: { error?: string, needed?: string, provided?: string } };

            if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'token_expired') {
                try {
                    await this.refresh();
                    await this.client.chat.postMessage({
                        channel: channel,
                        text: text
                    });
                } catch (refreshErr) {
                     console.error('Slack Error: Failed to refresh token and retry message', refreshErr);
                }
            } else if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'missing_scope') {
                console.error(`Slack Error: The provided token is missing required scopes. Needed: ${error.data.needed}, Provided: ${error.data.provided}`);
            } else if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'not_in_channel') {
                console.error(`Slack Error: The bot is not in the channel '${channel}'. Please invite the bot to the channel.`);
            } else {
                throw err;
            }
        }
    }
}
