import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Notification from '../lib/types/notification.js';
import { Permissions } from '../lib/auth.js';
import UserSetting from '../lib/types/user-setting.js';

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

            const setting = await UserSetting.from(config.pool, req.auth.id, 'notification');

            // TODO Merge setting with Map
            console.error(setting)

            res.json({
                settings: Array.from(settingsMap.values())
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/notification/settings', {
        name: 'Update Settings',
        group: 'NotificationSettings',
        auth: 'user',
        description: 'Get all notifications settings',
        body: 'req.body.UpdateNotificationSettings.json',
        res: 'res.Standard.json'
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

            const setting = await UserSetting.from(config.pool, req.auth.id, 'notification');

            // TODO Merge setting with Map
            console.error(setting)

            res.json({
                status: 200,
                message: 'Settings Updated'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
