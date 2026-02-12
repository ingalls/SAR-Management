import Config from './config.js';
import Slack from './slack.js';
import { and, gte, lt } from 'drizzle-orm';
import { Training } from './schema.js';
import moment from 'moment-timezone';

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
            let tz = 'America/Denver';
            try {
                tz = (await this.config.models.Server.from('timezone')).value;
            } catch (err) {
                // Fallback to default
            }

            const start = new Date();
            start.setDate(start.getDate() + 1);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 15);

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

                let location = training.location;
                const geom = training.location_geom as any;
                if (geom && geom.coordinates) {
                    location += ` (<https://www.google.com/maps/search/?api=1&query=${geom.coordinates[1]},${geom.coordinates[0]}|Map>)`
                }

                await slack.postMessage('testing', `:runner: *Upcoming Training:* <https://team.mesacountysar.com/training/${training.id}|${training.title}>\n*Location:* ${location}\n*Date:* ${start} - ${end}\n*Details:* ${training.body}`);

                return;
            }

        } catch (err) {
            console.error(err);
        }
    }
}
