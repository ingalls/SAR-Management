import formData from 'form-data';
import Mailgun, { Interfaces } from 'mailgun.js';
import Mailgen from 'mailgen';
import Err from '@openaddresses/batch-error';
import Config from './config.js';
import { Notification } from './schema.js';
import { InferSelectModel } from 'drizzle-orm';

const mailgun = new Mailgun(formData);

/**
 * @class
 *
 * @prop {Config} config Serverwide Config
 * @prop {Object} mailGenerator MailGen Generation API
 */
export default class Email {
    config: Config;
    mg: Interfaces.IMailgunClient;
    mailGenerator: Mailgen;

    constructor(config: Config) {
        this.config = config;

        this.mg = mailgun.client({
            username: 'api',
            key: config.MailGun
        });

        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: this.config.OrgName,
                link: this.config.URL
            }
        });
    }

    /**
     * Send an email verification to the user
     *
     * @param {Object} user
     * @param {String} user.username
     * @param {String} user.email
     * @param {String} user.token
     */
    async verify(user: {
        username: string;
        email: string;
        token: string;
    }): Promise<void> {
        const email = {
            body: {
                name: user.email,
                intro: 'SAR Email Confirmation',
                action: {
                    instructions: `Hello ${user.username}, to finish creating your account, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Verify Email',
                        link: String(new URL(`/login/verify?token=${user.token}`, this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, 'SAR Email Verification', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Confirmation Error');
        }
    }

    async forgot(user: {
        username: string;
        email: string;
        token: string;
    }): Promise<void> {
        const email = {
            body: {
                name: user.email,
                intro: 'SAR Password Reset',
                action: {
                    instructions: `Hello ${user.username}, to reset your password, please click here:`,
                    button: {
                        color: 'green',
                        text: 'Password Reset',
                        link: String(new URL(`/login/reset?token=${user.token}`, this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, 'SAR Password Reset', this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Forgot Error');
        }
    }

    async newuser(user: {
        fname: string;
        email: string;
    }): Promise<void> {
        const email = {
            body: {
                name: user.email,
                intro: `Welcome to ${this.config.OrgName}`,
                action: {
                    instructions: `Hello ${user.fname}, a SAR account has been set up for you. Please reset the password to log in.`,
                    button: {
                        color: 'green',
                        text: 'Set Password',
                        link: String(new URL('/login/forgot', this.config.URL))
                    }
                },
                outro: 'Problems? Contact Nick Ingalls: 202-390-6116 or rescue@ingalls.ca'
            }
        };

        try {
            await this.send(user.email, `Welcome to ${this.config.OrgName}`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Forgot Error');
        }
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        if (!to) throw new Err(400, null, 'send - to field required');
        if (!subject) throw new Err(400, null, 'send - subject field required');

        const from = `${this.config.OrgName} No Reply <robot@mesacountysar.com>`;

        try {
            await this.mg.messages.create('robot.mesacountysar.com', {
                to, from, subject,
                html: body
            });
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Failed to send email');
        }

    }

    async user_disabled(user: {
        email: string;
    }): Promise<void> {
        const email = {
            body: {
                name: user.email,
                intro: `${this.config.OrgName} - Account Disabled`,
                outro: 'Your account has been disabled - please notify us if this has been done in error'
            }
        };

        try {
            await this.send(user.email, `${this.config.OrgName} - Account Disabled`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Notification');
        }
    }

    async notify(
        user: {
            email: string;
        },
        notify: InferSelectModel<typeof Notification>
    ): Promise<void> {
        const email = {
            body: {
                name: user.email,
                intro: `${this.config.OrgName} - Notification`,
                action: {
                    instructions: notify.text,
                    button: {
                        color: 'green',
                        text: 'Check Notifications',
                        link: String(new URL('/notification', this.config.URL))
                    }
                },
                outro: ''
            }
        };

        try {
            await this.send(user.email, `${this.config.OrgName} - New Notification`, this.mailGenerator.generate(email));
        } catch (err) {
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Internal User Notification');
        }
    }
}
