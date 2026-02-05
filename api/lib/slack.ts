import { WebClient } from '@slack/web-api';
import Config from './config.js';

export default class Slack {
    client: WebClient;

    constructor(token: string) {
        this.client = new WebClient(token);
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

        return new Slack(token);
    }

    async postMessage(channel: string, text: string): Promise<void> {
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
            if (err.code === 'slack_webapi_platform_error' && err.data?.error === 'missing_scope') {
                console.error(`Slack Error: The provided token is missing required scopes. Needed: ${err.data.needed}, Provided: ${err.data.provided}`);
            } else if (err.code === 'slack_webapi_platform_error' && err.data?.error === 'not_in_channel') {
                console.error(`Slack Error: The bot is not in the channel '${channel}'. Please invite the bot to the channel.`);
            } else {
                throw err;
            }
        }
    }
}
