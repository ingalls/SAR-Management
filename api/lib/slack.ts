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

        await this.client.chat.postMessage({
            channel: channel,
            text: text
        });
    }
}
