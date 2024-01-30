import {
    User,
    UserSetting,
    Notification
} from './schema.js';
import * as pgtypes from './schema.js';
import Email from '../lib/email.js';
import Config from '../lib/config.js';
import { Permissions } from '../lib/auth.js';
import { InferInputModel } from 'drizzle-orm';

export default class Notify {
    pool: Pool<typeof pgtypes>;
    email?: Email;

    constructor(config: Config) {
        this.pool = config.pool;

        if (config.email) {
            this.email = new Email(config);
        }
    }

    async generate(type: string, uid: number, notification: InferInputModel<Notification>) {
        const notify = await Notification.generate(this.pool, {
            ...notification,
            uid,
        });
        const user = await User.from(this.pool, uid);

        if (this.email) {
            const setting = (await UserSetting.from(this.pool, uid, 'notification')).value;
            if (setting.disabled) return;
            if (!setting.settings) setting.settings = [];
            if (setting.settings[type] === undefined) setting.settings[type] = true;
            if (!setting.settings[type]) return;

            await this.email.notify(user, notify);
        }
    }

    async users(type, minperm, notification) {
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
