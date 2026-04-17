import Email from './email.js';
import { Permissions, PermissionsLevel } from './auth.js';
import Config from './config.js';
import { sql } from 'drizzle-orm';

export default class Notify {
    config: Config;
    email?: Email;

    constructor(config: Config) {
        this.config = config;

        if (config.email) {
            this.email = new Email(config);
        }
    }

    async generate(type: string, uid: number, notification: {
        text: string;
        url: string;
    }) {
        const notify = await this.config.models.Notification.generate({
            ...notification,
            uid,
        });

        const user = await this.config.models.User.from(uid);

        if (this.email) {
            let setting: Record<string, any>;
            try {
                setting = await this.config.models.UserSetting.from(sql`
                    uid = ${uid}
                    AND key = 'notification'
                `);
            } catch (err)  {
                console.error(err);

                setting = {
                    uid,
                    key: 'notification',
                    value: {}
                    
                };
            }

            if (setting.disabled) return;
            if (!setting.settings) setting.settings = [];
            if (setting.settings[type] === undefined) setting.settings[type] = true;
            if (!setting.settings[type]) return;

            await this.email.notify(user, notify);
        }
    }

    async users(type: string, minperm: PermissionsLevel, notification: { text: string; url: string }): Promise<void> {
        try {
            const permsMap = Permissions as Record<string, PermissionsLevel[]>;
            if (!permsMap[type]) throw new Error('Permission not included in permission set');
            if (!permsMap[type].includes(minperm)) throw new Error('Mim Perm not included in permission set');
            const perms = permsMap[type].slice(0, permsMap[type].indexOf(minperm) + 1);

            const users = (await this.config.models.Notification.users(type, perms)).items;

            for (const user of users) {
                await this.generate(type, user.id, notification);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
