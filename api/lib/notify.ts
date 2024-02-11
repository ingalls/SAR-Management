import {
    User,
    UserSetting,
    Notification
} from './schema.js';
import * as pgtypes from './schema.js';
import Email from './email.js';
import { Permissions } from './auth.js';
import { InferSelectModel } from 'drizzle-orm';
import Config from './config.js';

export default class Notify {
    config: Config;
    email?: Email;

    constructor(config: Config) {
        this.config = config;

        if (config.email) {
            this.email = new Email(config);
        }
    }

    async generate(type: string, uid: number, notification: InferSelectModel<typeof Notification>) {
        const notify = await this.config.models.Notification.generate({
            ...notification,
            uid,
        });

        const user = await this.config.models.User.from(uid);

        if (this.email) {
            const setting = (await UserSetting.from(this.pool, uid, 'notification')).value;
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

            const users = (await Notification.users(this.pool, type, perms)).users;

            for (const user of users) {
                await this.generate(type, user.id, notification);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
