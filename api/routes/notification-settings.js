import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Notification from '../lib/types/notification.js';
import { Permissions } from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/notification/settings', {
        name: 'Get Settings',
        group: 'NotificationSettings',
        auth: 'user',
        description: 'Get all notifications settings',
        res: 'res.ListNotificationSettings.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const settingsMap = new Map();
            settingsMap.set('Disable All', { name: 'Disable All', value: false });
            const settings = Object.keys(Permissions).forEach((setting) => {
                settingsMap.set(setting, {
                    name: setting,
                    value: true
                })
            });

            res.json({
                settings: Array.from(settingsMap.values())
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
