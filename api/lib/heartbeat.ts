import Config from './config.js';
import Slack from './slack.js';
import { and, gte, lt } from 'drizzle-orm';
import { Training } from './schema.js';
import moment from 'moment-timezone';
import cron from 'node-cron';

export default class Heartbeat {
    config: Config;

    constructor(config: Config, opts: { start?: boolean } = {}) {
        this.config = config;

        if (opts.start !== false) this.start();
    }

    start() {
        console.log('Heartbeat scheduled');

        cron.schedule('0 18 * * *', async () => {
            await this.pulseTrainings();
        });
    }

    async pulseTrainings() {
        try {
            let tz = 'America/Denver';
            try {
                tz = (await this.config.models.Server.from('timezone')).value;
            } catch (err) {
                console.error(err);
                // Fallback to default
            }

            const start = new Date();
            start.setDate(start.getDate() + 1);
            // Ensure we are working with midnight in the local context
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            const trainings = await this.config.models.Training.list({
                where: and(
                    gte(Training.start_ts, start.toISOString()),
                    lt(Training.start_ts, end.toISOString())
                )
            });

            if (!trainings.total) return;

            const slack = await Slack.create(this.config);

            console.log(`ok - Found ${trainings.total} trainings starting between ${start.toISOString()} and ${end.toISOString()}`);

            if (!slack) {
                console.error('Failed to initialize Slack client');
                return;
            }

            for (const training of trainings.items) {
                const start = moment(training.start_ts).tz(tz).format('MMM D, YYYY HH:mm');
                const end = moment(training.end_ts).tz(tz).format('HH:mm');

                let location = training.location || '_Not Set_';
                const geom = training.location_geom as any;
                if (geom && geom.coordinates) {
                    location += ` (<https://www.google.com/maps/search/?api=1&query=${geom.coordinates[1]},${geom.coordinates[0]}|Map>)`
                }

                const message = [
                    ':runner: *Upcoming Training:*',
                    `<https://team.mesacountysar.com/training/${training.id}|${training.title}>`,
                    `*Location:* ${location}`,
                    `*Date:* ${start} - ${end}`,
                    `*Details:* ${training.body}`
                ].join('\n');

                await slack.postMessage('general', message);
            }

        } catch (err) {
            console.error(err);
        }
    }
}
