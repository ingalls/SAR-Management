import Notification from './types/notification.js';
import User from '../lib/types/user.js';

export default class Notify {
    constructor(config, email = null) {
        this.pool = config.pool;

        if (config.email) {
            this.email = email;
        } else {
            this.email = null;
        }
    }

    async generate(uid, text) {
        const notify = await Notification.generate(this.pool, { uid, text });
        const user = await User.from(this.pool, uid);

        if (this.email) await this.email.notify(user, notify);
    }
}
