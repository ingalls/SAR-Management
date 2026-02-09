import { WebClient } from '@slack/web-api';
import Config from './config.js';
import { sql } from 'drizzle-orm';

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

    async userGroupSync(team_id: number): Promise<{ errors: string[] }> {
        const errors: string[] = [];
        await this.check();

        const mappings = await this.config.models.TeamChannel.list({
            where: sql`team_id = ${team_id}`
        });

        if (!mappings.total) return { errors };

        // 1. Get all users in the team
        const users = await this.config.models.User.augmented_list({
            limit: 1000,
            where: sql`teams_id @> ARRAY[${team_id}::INT]`
        });

        // 2. Fetch all slack users to map emails
        const slackUsers = await this.client.users.list({ limit: 1000 });
        if (!slackUsers.ok || !slackUsers.members) throw new Error('Slack: Failed to list users');

        const emailToSlackId = new Map(
            slackUsers.members
                .filter(u => u.profile?.email && !u.deleted)
                .map(u => [u.profile!.email!.toLowerCase(), u.id!])
        );

        // 3. Resolve Team Users to Slack IDs
        const teamSlackIds: string[] = [];
        for (const user of users.items) {
            if (user.email && emailToSlackId.has(user.email.toLowerCase())) {
                teamSlackIds.push(emailToSlackId.get(user.email.toLowerCase())!);
            }
        }

        if (teamSlackIds.length === 0) return { errors };

        // 3.5 Sync User Group
        try {
            const team = await this.config.models.Team.from(team_id);
            let handle = team.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if (handle.length > 20) handle = handle.substring(0, 20);
            handle = handle.replace(/-+$/, '');

            const groups = await this.client.usergroups.list({ include_disabled: true });
            let group = groups.usergroups?.find(g => g.handle === handle || g.name === team.name);

            if (!group) {
                try {
                    const res = await this.client.usergroups.create({ name: team.name, handle });
                    group = res.usergroup;
                } catch (err: any) {
                    if (err.data?.error === 'paid_teams_only') {
                        // Ignore
                    } else if (err.data?.error === 'invalid_handle' || err.data.error === 'name_taken') {
                        // Try creating without handle or with name variations?
                        // For name_taken, we might have missed it in the list or it's taken by a channel
                         errors.push(`Slack: Failed to create usergroup '${team.name}' - ${err.data?.error}`);
                    } else {
                         errors.push(`Slack: Failed to create usergroup '${team.name}' - ${err.data?.error || err.message}`);
                    }
                }
            } else if ((group as any).date_delete) {
                try {
                    const res = await this.client.usergroups.enable({ usergroup: group.id! });
                    group = res.usergroup;
                } catch (err: any) {
                    errors.push(`Slack: Failed to enable usergroup '${team.name}' - ${err.data?.error || err.message}`);
                }
            }

            if (group && group.id) {
                try {
                    await this.client.usergroups.users.update({ usergroup: group.id, users: teamSlackIds.join(',') });
                } catch (err: any) {
                     errors.push(`Slack: Failed to update usergroup members '${team.name}' - ${err.data?.error || err.message}`);
                }
            }
        } catch (err: any) {
             errors.push(`Slack: UserGroup sync failed - ${err.message}`);
        }

        // 4. Sync to Channels
        // Note: We can't easily "sync" (overwrite) members of a channel without removing everyone first,
        // which might be destructive. Instead, we'll ensure all team members are invited.
        // For strict sync, we'd need to assume the SAR Team owns the channel.
        
        for (const mapping of mappings.items) {
            try {
                // Get current members to avoid unnecessary calls
                const currentMembers = await this.client.conversations.members({ channel: mapping.channel_id });
                if (currentMembers.ok && currentMembers.members) {
                    const currentSet = new Set(currentMembers.members);
                    const toInvite = teamSlackIds.filter(id => !currentSet.has(id));

                    if (toInvite.length > 0) {
                        await this.client.conversations.invite({
                            channel: mapping.channel_id,
                            users: toInvite.join(',')
                        });
                    }
                }
            } catch (err: any) {
                 const msg = `Slack: Failed to sync users to channel ${mapping.channel_name}`;
                 console.error(msg, err);
                 if (err.data && err.data.error) {
                    errors.push(`${msg} - ${err.data.error}`);
                 } else {
                    errors.push(msg);
                 }
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
