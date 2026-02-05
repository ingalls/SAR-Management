import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';
import Heartbeat from '../lib/heartbeat.js';

export default async function router(schema: Schema, config: Config) {
    await schema.post('/heartbeat/training', {
        name: 'Pulse Training',
        group: 'Heartbeat',
        description: 'Manually trigger training notification pulse',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            const heartbeat = new Heartbeat(config, { start: false });
            await heartbeat.pulseTrainings();

            res.json({
                status: 200,
                message: 'Pulse Triggered'
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
