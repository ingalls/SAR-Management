import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import Slack from '../lib/slack.js';
import Err from '@openaddresses/batch-error';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/slack/channels', {
        name: 'List Channels',
        group: 'Slack',
        description: 'List all Slack Channels',
        res: Type.Object({
            channels: Type.Array(Type.Object({
                id: Type.String(),
                name: Type.String(),
                num_members: Type.Optional(Type.Integer())
            }))
        })
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const slack = await Slack.create(config);
            if (!slack) throw new Err(400, null, 'Slack is not configured');

            await slack.check();

            const list = await slack.client.conversations.list({
                types: 'public_channel,private_channel',
                exclude_archived: true,
                limit: 1000
            });

            if (!list.ok) throw new Err(500, null, 'Slack API Error');

            res.json({
                channels: list.channels?.map((c) => {
                    if (typeof c === 'string') {
                        return {
                            id: c,
                            name: 'Unknown'
                        }
                    } else {
                        return {
                            id: c.id || '',
                            name: c.name || 'Unknown',
                            num_members: c.num_members
                        }
                    }
                }) || []
            });

        } catch (err) {
            Err.respond(err, res);
        }
    });

}
