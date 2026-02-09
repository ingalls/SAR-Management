import { WebClient } from '@slack/web-api';
import Config from './config.js';

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
        } catch (err) {
            return;
        }

        let token;
        try {
            token = (await config.models.Server.from('slack_token')).value;
        } catch (err) {
            return;
        }

        let refreshToken, clientId, clientSecret, expiry;
        try { refreshToken = (await config.models.Server.from('slack_refresh')).value; } catch (err) {}
        try { clientId = (await config.models.Server.from('slack_client_id')).value; } catch (err) {}
        if (!clientId) {
            try { clientId = (await config.models.Server.from('slack_app_id')).value; } catch (err) {}
        }
        try { clientSecret = (await config.models.Server.from('slack_client_secret')).value; } catch (err) {}
        try { expiry = parseInt((await config.models.Server.from('slack_token_expiry')).value); } catch (err) {}

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
        } catch (err: any) {
            if (err.code === 'slack_webapi_platform_error' && err.data?.error === 'token_expired') {
                try {
                    await this.refresh();
                    await this.client.chat.postMessage({
                        channel: channel,
                        text: text
                    });
                } catch (refreshErr) {
                     console.error('Slack Error: Failed to refresh token and retry message', refreshErr);
                }
            } else if (err.code === 'slack_webapi_platform_error' && err.data?.error === 'missing_scope') {
                console.error(`Slack Error: The provided token is missing required scopes. Needed: ${err.data.needed}, Provided: ${err.data.provided}`);
            } else if (err.code === 'slack_webapi_platform_error' && err.data?.error === 'not_in_channel') {
                console.error(`Slack Error: The bot is not in the channel '${channel}'. Please invite the bot to the channel.`);
            } else {
                throw err;
            }
        }
    }
}
