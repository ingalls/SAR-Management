import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Notification from '../lib/types/notification.js';

export default async function router(schema, config) {
    await schema.get('/notification', {
        name: 'Get Notifications',
        group: 'Notifications',
        auth: 'user',
        description: 'Get all notifications'
        // req: 'req.query.ListUsers.json',
        // res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json({
                total: 0
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/notification', {
        name: 'Delete Notifications',
        group: 'Notifications',
        auth: 'user',
        description: 'Delete all notifications',
        res: 'res.Standard.json'
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
}
