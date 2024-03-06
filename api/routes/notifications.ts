import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Notification from '../lib/types/notification.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/notification', {
        name: 'Get Notifications',
        group: 'Notifications',
        auth: 'user',
        description: 'Get all notifications',
        res: 'res.ListNotifications.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Notification.list(config.pool, req.auth.id, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/notification', {
        name: 'Delete Notifications',
        group: 'Notifications',
        auth: 'user',
        description: 'Delete all notifications',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            await Notification.delete(config.pool, req.auth.id, {
                column: 'uid'
            });

            return res.json({
                status: 200,
                message: 'Notifications Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/notification/:notificationid', {
        name: 'Delete Notification',
        group: 'Notifications',
        auth: 'user',
        description: 'Delete all notifications',
        params: Type.Object({
            notificationid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const notification = await Notification.from(config.pool, req.params.notificationid);

            if (req.auth.id !== notification.uid) {
                throw new Err(400, null, 'Not your notification');
            }

            await notification.delete();

            return res.json({
                status: 200,
                message: 'Notifications Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
