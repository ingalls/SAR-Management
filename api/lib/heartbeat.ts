import Config from './config.js';
import Slack, { SlackUser } from './slack.js';
import { and, gte, lt } from 'drizzle-orm';
import { Training } from './schema.js';
import { PromisePool } from '@supercharge/promise-pool';
import moment from 'moment-timezone';
import cron from 'node-cron';

interface PointGeometry {
    type: 'Point';
    coordinates: [number, number];
}

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

        cron.schedule('0 19 * * *', async () => {
            await this.pulseSlack();
        });

        cron.schedule('0 * * * *', async () => {
            await this.monitorSlackUsers();
        });
    }

    // Accepts an existing Slack instance so pulseSlack can reuse the one it already created.
    async monitorSlackUsers(slack?: Slack) {
        try {
            if (!slack) {
                slack = await Slack.create(this.config);
                if (!slack) return;
            }

            const [slackUsers, dbUsers, linkedUsers] = await Promise.all([
                slack.getUsers(),
                this.config.models.User.list({ limit: 5000 }),
                this.config.models.User.listLinked('slack::userid'),
            ]);

            // Index active, non-bot Slack users by email and ID
            const slackUsersByEmail = new Map<string, SlackUser>();
            const slackUsersById = new Map<string, SlackUser>();
            for (const sUser of slackUsers) {
                if (!sUser.deleted && !sUser.is_bot && sUser.id !== 'USLACKBOT' && sUser.profile?.email) {
                    slackUsersByEmail.set(sUser.profile.email.toLowerCase(), sUser);
                    slackUsersById.set(sUser.id, sUser);
                }
            }

            // Index already-linked DB user IDs so we can skip them below
            const linkedUids = new Set(linkedUsers.map((l: any) => l.uid));

            // Link DB users whose email matches a Slack user
            for (const user of dbUsers.items) {
                if (linkedUids.has(user.id)) continue;
                const sUser = slackUsersByEmail.get(user.email.toLowerCase());
                if (!sUser) continue;
                try {
                    await this.config.models.User.addExternal(user.id, 'slack::userid', sUser.id);
                    console.log(`Linked User ${user.email} -> Slack ID ${sUser.id}`);
                } catch (err) {
                    console.error(`Failed to link User ${user.email} -> Slack ID ${sUser.id}`, err);
                }
            }

            // Remove links whose Slack ID no longer exists in the workspace
            for (const link of linkedUsers) {
                if (!slackUsersById.has((link as any).value)) {
                    try {
                        await this.config.models.User.removeExternal((link as any).uid, 'slack::userid');
                        console.log(`Unlinked User ${(link as any).uid} -> Slack ID ${(link as any).value}`);
                    } catch (err) {
                        console.error(`Failed to unlink User ${(link as any).uid} -> Slack ID ${(link as any).value}`, err);
                    }
                }
            }

            // Report Slack users with no matching DB account
            const dbEmails = new Set(dbUsers.items.map((u: any) => u.email.toLowerCase()));
            const unknownUsers = [...slackUsersByEmail.values()].filter(u => !dbEmails.has(u.profile.email.toLowerCase()));
            if (unknownUsers.length > 0) {
                console.log('--- Unknown Slack Users (Not in DB) ---');
                for (const u of unknownUsers) console.log(`  ${u.real_name} (@${u.name}) - ${u.profile.email}`);
                console.log('---------------------------------------');
            }

            // Report active DB users not present in Slack
            const missingFromSlack = dbUsers.items.filter((u: any) => !u.disabled && !slackUsersByEmail.has(u.email.toLowerCase()));
            if (missingFromSlack.length > 0) {
                console.log('--- DB Users Missing from Slack ---');
                for (const u of missingFromSlack) console.log(`  ${(u as any).fname} ${(u as any).lname} - ${(u as any).email}`);
                console.log('-----------------------------------');
            }

        } catch (err) {
            console.error('Failed to monitor Slack users', err);
        }
    }

    async pulseSlack() {
        try {
            const slack = await Slack.create(this.config);
            if (!slack) return;

            await this.monitorSlackUsers(slack);

            const teams = await this.config.models.Team.list();
            console.log(`ok - Syncing Slack Groups for ${teams.total} teams`);

            await PromisePool
                .withConcurrency(5)
                .for(teams.items)
                .process(async (team: any) => {
                    try {
                        await slack.userGroupSync(team.id);
                    } catch (err) {
                        console.error(`Failed to sync team ${team.id}`, err);
                    }
                });
        } catch (err) {
            console.error(err);
        }
    }

    async pulseTrainings() {
        try {
            let tz = 'America/Denver';
            try {
                tz = (await this.config.models.Server.from('timezone')).value;
            } catch (err) {
                console.error(err);
            }

            const windowStart = new Date();
            windowStart.setDate(windowStart.getDate() + 1);
            windowStart.setHours(0, 0, 0, 0);

            const windowEnd = new Date(windowStart);
            windowEnd.setDate(windowEnd.getDate() + 1);

            const trainings = await this.config.models.Training.list({
                where: and(
                    gte(Training.start_ts, windowStart.toISOString()),
                    lt(Training.start_ts, windowEnd.toISOString())
                )
            });

            if (!trainings.total) return;

            const slack = await Slack.create(this.config);
            if (!slack) {
                console.error('Failed to initialize Slack client');
                return;
            }

            console.log(`ok - Found ${trainings.total} trainings starting between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

            for (const training of trainings.items) {
                const startStr = moment(training.start_ts).tz(tz).format('MMM D, YYYY HH:mm');
                const endStr = moment(training.end_ts).tz(tz).format('HH:mm');

                let location = training.location || '_Not Set_';
                const geom = training.location_geom as unknown as PointGeometry;
                if (geom && geom.coordinates) {
                    location += ` (<https://www.google.com/maps/search/?api=1&query=${geom.coordinates[1]},${geom.coordinates[0]}|Map>)`;
                }

                const message = [
                    ':runner: *Upcoming Training:*',
                    `<https://team.mesacountysar.com/training/${training.id}|${training.title}>`,
                    `*Location:* ${location}`,
                    `*Date:* ${startStr} - ${endStr}`,
                    `*Details:* ${training.body}`
                ].join('\n');

                await slack.postMessage('general', message);
            }

        } catch (err) {
            console.error(err);
        }
    }
}
