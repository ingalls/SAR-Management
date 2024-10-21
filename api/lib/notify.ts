import Email from './email.js';
import { Permissions } from './auth.js';
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
            let setting;
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

    async users(type, minperm, notification): Promise<void> {
        try {
            if (!Permissions[type]) throw new Error('Permission not included in permission set');
            if (!Permissions[type].includes(minperm)) throw new Error('Mim Perm not included in permission set');
            const perms = Permissions[type].slice(0, Permissions[type].indexOf(minperm));

            const users = (await this.config.models.Notification.users(type, perms)).items;

            for (const user of users) {
                await this.generate(type, user.id, notification);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
