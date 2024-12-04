import Err from '@openaddresses/batch-error';
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, NotificationResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/notification', {
        name: 'Get Notifications',
        group: 'Notifications',
        description: 'Get all notifications',
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(NotificationResponse)
        })
    }, async (req, res) => {
        try {
            const user = await Auth.is_auth(config, req);

            res.json(await config.models.Notification.list({
                where: sql`uid = ${user.id}`
            }));
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/notification', {
        name: 'Delete Notifications',
        group: 'Notifications',
        description: 'Delete all notifications',
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_auth(config, req);

            await config.models.Notification.delete(sql`uid = ${user.id}`);

            res.json({
                status: 200,
                message: 'Notifications Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.delete('/notification/:notificationid', {
        name: 'Delete Notification',
        group: 'Notifications',
        description: 'Delete all notifications',
        params: Type.Object({
            notificationid: Type.Integer(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_auth(config, req);

            const notification = await config.models.Notification.from(req.params.notificationid);

            if (user.id !== notification.uid) {
                throw new Err(400, null, 'Not your notification');
            }

            await config.models.Notification.delete(req.params.notificationid);

            res.json({
                status: 200,
                message: 'Notifications Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
