import Config from './config.js';
import Slack from './slack.js';
import { sql } from 'drizzle-orm';

export default class Heartbeat {
    config: Config;

    constructor(config: Config, opts: { start?: boolean } = {}) {
        this.config = config;

        if (opts.start !== false) this.start();
    }

    start() {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1);
        nextHour.setMinutes(0);
        nextHour.setSeconds(0);
        nextHour.setMilliseconds(0);

        const delay = nextHour.getTime() - now.getTime();

        console.log(`Heartbeat scheduled for ${nextHour.toISOString()}`);

        setTimeout(() => {
            this.pulse();
            // Then run every hour
            setInterval(() => {
                this.pulse();
            }, 60 * 60 * 1000);
        }, delay);
    }

    async pulse() {
        console.log('Heartbeat Pulse');
        if (new Date().getHours() === 18) {
            await this.pulseTrainings();
        }
    }

    async pulseTrainings() {
        try {
            const start = new Date();
            start.setDate(start.getDate() + 1);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            const trainings = await this.config.models.Training.list({
                where: sql`
                    start_ts >= ${start.toISOString()}
                    AND start_ts < ${end.toISOString()}
                `
            });

            if (!trainings.total) return;

            let enabled = false;
            try {
                enabled = (await this.config.models.Server.from('slack_enabled')).value ? true : false;
            } catch (err) {
                return;
            }

            if (!enabled) return;

            let token;
            try {
                token = (await this.config.models.Server.from('slack_token')).value;
            } catch (err) {
                return;
            }

            const slack = new Slack(token);

            for (const training of trainings.items) {
                await slack.postMessage('general', `:runner: *Training Tomorrow:* ${training.title}\n> ${training.body}`);
            }

        } catch (err) {
            console.error(err);
        }
    }
}
