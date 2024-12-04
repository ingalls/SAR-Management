import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import { sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import { Permissions } from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/notification/settings', {
        name: 'Get Settings',
        group: 'NotificationSettings',
        description: 'Get all notifications settings',
        res: Type.Object({
            disabled: Type.Boolean(),
            settings: Type.Array(Type.Object({
                name: Type.String(),
                value: Type.Boolean()
            }))
        })
    }, async (req, res) => {
        try {
            const user = await Auth.is_auth(config, req);

            const settingsMap = new Map();
            Object.keys(Permissions).forEach((setting) => {
                settingsMap.set(setting, { name: setting, value: true });
            });

            const setting: any = (await config.models.UserSetting.from(sql`
                uid = ${user.id} AND key = 'notification'
            `)).value;
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
             Err.respond(err, res);
        }
    });

    await schema.patch('/notification/settings', {
        name: 'Update Settings',
        group: 'NotificationSettings',
        description: 'Get all notifications settings',
        body: Type.Object({
            disabled: Type.Boolean(),
            settings: Type.Array(Type.Object({
                name: Type.String(),
                value: Type.Boolean()
            }))
        }),
        res: Type.Object({
            disabled: Type.Boolean(),
            settings: Type.Array(Type.Object({
                name: Type.String(),
                value: Type.Boolean()
            }))
        })
    }, async (req, res) => {
        try {
            const user = await Auth.is_auth(config, req);

            const known = Object.keys(Permissions);

            const value = {
                disabled: req.body.disabled,
                settings: {}
            };

            for (const setting of req.body.settings) {
                if (!known.includes(setting.name)) throw new Err(400, null, `Unknown Setting: ${setting.name}`);
                value.settings[setting.name] = setting.value;
            }

            const setting = await config.models.UserSetting.from(sql`
                uid = ${user.id} AND key = 'notification'
            `);

            if (!Object.keys(setting.value as object).length) {
                await config.models.UserSetting.generate({
                    uid: user.id,
                    key: 'notification',
                    value
                });
            } else {
                await config.models.UserSetting.commit(sql`
                    uid = ${user.id} AND key = 'notification'
                `, { value });
            }

            res.json(req.body);
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
