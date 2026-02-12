import { WebClient } from '@slack/web-api';
import Config from './config.js';
import { sql } from 'drizzle-orm';
import { PromisePool } from '@supercharge/promise-pool';

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

        console.error(email)
        const res = await this.client.users.lookupByEmail({ email });
        console.error(res);

        if (!res.ok || !res.user) throw new Error(`Slack: Failed to lookup user ${email}`);

        return res.user;
    }
    async getUserGroup(name: string) {
        await this.check();

        let handle = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (handle.length > 20) handle = handle.substring(0, 20);
        handle = handle.replace(/-+$/, '');

        const groups = await this.client.usergroups.list({ include_disabled: true });
        let group = groups.usergroups?.find(g => g.handle === handle || g.name === name);

        if (!group) {
            const res = await this.client.usergroups.create({ name, handle });
            group = res.usergroup;
        } else if ((group as any).date_delete) {
            const res = await this.client.usergroups.enable({ usergroup: group.id! });
            group = res.usergroup;
        }

        return group;
    }
    async userGroupSync(team_id: number): Promise<{ errors: string[] }> {
        const errors: string[] = [];
        await this.check();

        const team = await this.config.models.Team.from(team_id);

        const mappings = await this.config.models.TeamChannel.list({
            where: sql`team_id = ${team_id}`
        });

        if (!mappings.total) {
            console.warn(`Slack: No channel mappings found for team ${team_id} - skipping sync`);
            return { errors };
        }

        const users = await this.config.models.User.augmented_list({
            limit: 1000,
            where: sql`
                teams_id @> ARRAY[${team_id}::INT]
                AND disabled = false
            `
        });

        const { results } = await PromisePool
            .withConcurrency(10)
            .for(users.items)
            .process(async (user) => {
                if (!user.email) return null;
                try {
                    const slackUser = await this.getUser(user.email);
                    return slackUser.id;
                } catch (err) {
                    console.error(err);
                    return null;
                }
            });

        const teamSlackIds = results.filter((id) => id !== null && id !== undefined) as string[];

        if (teamSlackIds.length === 0) {
            console.warn(`Slack: No valid Slack users found for team ${team_id} - skipping sync`);
            return { errors };
        }

        const group = await this.getUserGroup(team.name);

        console.error('GROUP', group)
        return { errors };

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
