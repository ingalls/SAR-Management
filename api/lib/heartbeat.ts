import Config from './config.js';
import Slack, { SlackUser, SlackMessage, SlackBlocks } from './slack.js';
import { and, gte, lt } from 'drizzle-orm';
import { Training } from './schema.js';
import { PromisePool } from '@supercharge/promise-pool';
import moment from 'moment-timezone';
import cron from 'node-cron';

interface PointGeometry {
    type: 'Point';
    coordinates: [number, number];
}

type TrainingRow = typeof Training.$inferSelect;

const DETAILS_LIMIT = 1500;

function escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mrkdwn(markdown: string): string {
    return escape(markdown)
        .replace(/^#{1,6}\s+(.+)$/gm, '*$1*')
        .replace(/\*\*(.+?)\*\*/g, '*$1*')
        .replace(/__(.+?)__/g, '*$1*')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<$2|$1>')
        .replace(/^\s*[-*]\s+/gm, '• ')
        .trim();
}

export function trainingMessage(training: TrainingRow, tz: string, base: URL): SlackMessage {
    const url = new URL(`/training/${training.id}`, base).toString();
    const start = moment(training.start_ts).tz(tz);
    const end = moment(training.end_ts).tz(tz);
    const when = `${start.format('ddd, MMM D')} · ${start.format('h:mm A')} – ${end.format('h:mm A z')}`;

    const geom = training.location_geom as unknown as PointGeometry | null;
    const map = geom?.coordinates
        ? `https://www.google.com/maps/search/?api=1&query=${geom.coordinates[1]},${geom.coordinates[0]}`
        : null;

    let location = training.location ? escape(training.location) : '_Not set_';
    if (map) location = `<${map}|${location}>`;

    let details = mrkdwn(training.body);
    if (details.length > DETAILS_LIMIT) details = details.slice(0, DETAILS_LIMIT).trimEnd() + '…';

    const blocks: SlackBlocks = [{
        type: 'header',
        text: { type: 'plain_text', text: ':runner: Upcoming Training', emoji: true }
    }, {
        type: 'section',
        text: { type: 'mrkdwn', text: `*<${url}|${escape(training.title)}>*` }
    }, {
        type: 'section',
        fields: [
            { type: 'mrkdwn', text: `*When*\n${when}` },
            { type: 'mrkdwn', text: `*Where*\n${location}` }
        ]
    }];

    if (details) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: details }
        });
    }

    const buttons: Extract<SlackBlocks[number], { type: 'actions' }>['elements'] = [{
        type: 'button',
        text: { type: 'plain_text', text: 'View Training', emoji: true },
        url,
        style: 'primary',
        action_id: 'training_view'
    }];

    if (map) {
        buttons.push({
            type: 'button',
            text: { type: 'plain_text', text: 'Open Map', emoji: true },
            url: map,
            action_id: 'training_map'
        });
    }

    blocks.push({ type: 'actions', elements: buttons });

    if (training.required) {
        blocks.push({
            type: 'context',
            elements: [{ type: 'mrkdwn', text: ':warning: Attendance at this training is *required*.' }]
        });
    }

    return {
        text: `Upcoming Training: ${training.title} — ${when}`,
        blocks
    };
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
                    } catch (err: any) {
                        if (err.status === 400 && err.safe === 'Slack User Group Sync is disabled for this team') {
                            console.log(`ok - ${team.name} has no Slack User Group`);
                        } else {
                            console.error(`Failed to sync team ${team.name}`, err);
                        }
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
                await slack.postMessage('general', trainingMessage(training, tz, this.config.APIURL));
            }

        } catch (err) {
            console.error(err);
        }
    }
}
