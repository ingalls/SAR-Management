import { WebClient } from '@slack/web-api';

export default class Slack {
    client: WebClient;

    constructor(token: string) {
        this.client = new WebClient(token);
    }

    async postMessage(channel: string, text: string): Promise<void> {
        if (!this.client.token) return;

        await this.client.chat.postMessage({
            channel: channel,
            text: text
        });
    }
}
