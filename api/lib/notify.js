import Notification from './types/notification.js';
import User from '../lib/types/user.js';
import UserSetting from '../lib/types/user-setting.js';

export default class Notify {
    constructor(config, email = null) {
        this.pool = config.pool;

        if (config.email) {
            this.email = email;
        } else {
            this.email = null;
        }
    }

    async generate(type, uid, text) {
        const notify = await Notification.generate(this.pool, { uid, text });
        const user = await User.from(this.pool, uid);

        if (this.email) {
            const setting = (await UserSetting.from(this.pool, uid, 'notification')).value;
            if (setting.disabled) return;
            if (setting.settings[type] === undefined) setting.settings[type] = true;
            if (!setting.settings[type]) return;

            await this.email.notify(user, notify);
        }
    }
}
