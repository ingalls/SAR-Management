import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
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
            Object.keys(Permissions).forEach((setting) => {
                settingsMap.set(setting, { name: setting, value: true });
            });

            const setting = (await UserSetting.from(config.pool, req.auth.id, 'notification')).value;
            if (!setting.disabled) setting.disabled = false;
            if (!setting.settings) {
                setting.settings = [];
            } else {
                for (const s of Object.keys(setting.settings)) {
                    settingsMap.set(s, {
                        name: s,
                        value: setting.settings[s]
                    });
                }
            }

            res.json({
                disabled: setting.disabled,
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
        res: 'res.ListNotificationSettings.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const known = Object.keys(Permissions);

            const value = {
                disabled: req.body.disabled,
                settings: {}
            };

            for (const setting of req.body.settings) {
                if (!known.includes(setting.name)) throw new Err(400, null, `Unknown Setting: ${setting.name}`);
                value.settings[setting.name] = setting.value;
            }

            const setting = await UserSetting.from(config.pool, req.auth.id, 'notification');

            if (!Object.keys(setting.value).length) {
                await UserSetting.generate(config.pool, {
                    uid: req.auth.id,
                    key: 'notification',
                    value
                });
            } else {
                await setting.commit({ value });
            }

            res.json(req.body);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
