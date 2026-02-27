import Config from './config.js';
import Slack, { SlackUser } from './slack.js';
import { and, gte, lt } from 'drizzle-orm';
import { Training } from './schema.js';
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

    async monitorSlackUsers() {
        try {
            const slack = await Slack.create(this.config);
            if (!slack) return;

            const slackUsers = await slack.getUsers();
            
            // Map slackUsers by email for easy lookup
            const slackUsersByEmail = new Map<string, SlackUser>();
            const slackUsersById = new Map<string, SlackUser>();
            for (const sUser of slackUsers) {
                if (
                    !sUser.deleted && 
                    !sUser.is_bot && 
                    sUser.id !== 'USLACKBOT' && 
                    sUser.profile && 
                    sUser.profile.email
                ) {
                    slackUsersByEmail.set(sUser.profile.email.toLowerCase(), sUser);
                    slackUsersById.set(sUser.id, sUser);
                }
            }

            // Find DB users missing the 'slack::userid' integration
            const missingSlack = await this.config.models.User.listMissingExternal('slack::userid');

            for (const user of missingSlack) {
                const email = user.email.toLowerCase();
                const sUser = slackUsersByEmail.get(email);

                if (sUser) {
                    // Match found! Create the external mapping
                    try {
                        await this.config.models.User.addExternal(user.id, 'slack::userid', sUser.id);
                        console.log(`Linked User ${user.email} -> Slack ID ${sUser.id}`);
                    } catch (err) {
                        console.error(`Failed to link User ${user.email} -> Slack ID ${sUser.id}`, err);
                    }
                }
            }

            // Remove Invalid Slack Users
            const linkedUsers = await this.config.models.User.listLinked('slack::userid');
            for (const link of linkedUsers) {
                if (!slackUsersById.has(link.value)) {
                    try {
                        await this.config.models.User.removeExternal(link.uid, 'slack::userid');
                        console.log(`Unlinked User ${link.uid} -> Slack ID ${link.value}`);
                    } catch (err) {
                        console.error(`Failed to unlink User ${link.uid} -> Slack ID ${link.value}`, err);
                    }
                }
            }


            // --- Report Unknown Slack Users ---
            const dbUsers = await this.config.models.User.list({ limit: 5000 });
            const dbEmails = new Set(dbUsers.items.map(u => u.email.toLowerCase()));

            const unknownUsers: SlackUser[] = [];
            for (const [email, sUser] of slackUsersByEmail) {
                if (!dbEmails.has(email)) {
                    unknownUsers.push(sUser);
                }
            }
            if (unknownUsers.length > 0) {
                console.log('--- Unknown Slack Users (Not in DB) ---');
                for (const u of unknownUsers) {
                    console.log(`User: ${u.real_name} (@${u.name}) - ${u.profile.email}`);
                }
                console.log('---------------------------------------');
            }

            // --- Report DB Users Not in Slack ---
            const missingSlackUsers: (typeof dbUsers.items)[number][] = [];
            for (const user of dbUsers.items) {
                if (!user.disabled && !slackUsersByEmail.has(user.email.toLowerCase())) {
                     missingSlackUsers.push(user);
                }
            }

            if (missingSlackUsers.length > 0) {
                 console.log('--- DB Users Missing from Slack ---');
                 for (const u of missingSlackUsers) {
                     console.log(`User: ${u.fname} ${u.lname} - ${u.email}`);
                 }
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
            
            this.monitorSlackUsers();

            const teams = await this.config.models.Team.list();
            console.log(`ok - Syncing Slack Groups for ${teams.total} teams`);

            for (const team of teams.items) {
                try {
                    await slack.userGroupSync(team.id);
                } catch (err) {
                    console.error(`Failed to sync team ${team.id}`, err);
                }
            }
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
                const geom = training.location_geom as unknown as PointGeometry;
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
