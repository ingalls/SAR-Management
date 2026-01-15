import Err from '@openaddresses/batch-error';
import moment from 'moment';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './schema.js';
import { InferSelectModel } from 'drizzle-orm';
import Config from './config.js';
import { promisify } from 'util';
import crypto from 'crypto';
import { generateSecret } from 'otplib';

const randomBytes = promisify(crypto.randomBytes)

/**
 * @class
 */
export default class Login {
    /**
     * Verify a password reset token
     *
     * @param {String}  token           Password reset token
     */
    static async verify(config: Config, token: string): Promise<InferSelectModel<typeof User>> {
        if (!token) throw new Err(400, null, 'token required');

        const reset = await config.models.UserReset.from(sql`
            expires > Now()
            AND token = ${token}
            AND action = ${'verify'}
        `);
        await config.models.UserReset.delete(sql`uid = ${reset.uid}`);

        const user = await config.models.User.from(reset.uid);

        if (user.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        return await config.models.User.commit(reset.uid, {
            validated: true
        });
    }

    static async reset(config: Config, body): Promise<InferSelectModel<typeof User>> {
        if (!body.token) throw new Err(400, null, 'token required');
        if (!body.password) throw new Err(400, null, 'password required');

        const reset = await config.models.UserReset.from(sql`
            expires > Now()
            AND token = ${body.token}
            AND action = ${'reset'}
        `);
        await config.models.UserReset.delete(sql`uid = ${reset.uid}`);

        const user = await config.models.User.from(reset.uid);

        if (user.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        return await config.models.User.commit(reset.uid, {
            validated: true,
            password: await bcrypt.hash(body.password, 10)
        });
    }

    /**
     * Given a username or email, generate a password reset or validation email
     *
     * @param {string}  username        username or email to reset
     * @param {string}  [action=reset]  'reset' or 'verify'
     */
    static async forgot(config: Config, username: string, action = 'reset'): Promise<{
        uid: number;
        username: string;
        email: string;
        token: string;
    }> {
        if (!username || !username.length) throw new Err(400, null, 'username must not be empty');

        const u = await config.models.User.from(sql`
            Lower(username) = ${username.toLowerCase()}
            OR Lower(email) = ${username.toLowerCase()}
        `);

        await config.models.UserReset.delete(sql`uid = ${u.id}`);

        if (u.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        const reset = await config.models.UserReset.generate({
            uid: u.id,
            expires: moment().add(1, 'hour').toISOString(),
            token: (await randomBytes(40)).toString('hex'),
            action: action
        });

        return {
            uid: u.id,
            username: u.username,
            email: u.email,
            token: reset.token
        };
    }

    static async attempt(config: Config, body, secret): Promise<{
        id: number;
        username: string;
        access: string;
        email: string;
        token?: string;
        secret?: string;
    }> {
        if (!body.username) throw new Err(400, null, 'username required');
        if (!body.password) throw new Err(400, null, 'password required');

        let user;
        try {
            user = await config.models.User.from(sql`
                Lower(username) = ${body.username.toLowerCase()}
                OR Lower(email) = ${body.username.toLowerCase()}
            `);
        } catch (err) {
            throw new Err(403, err instanceof Error ? err : new Error(String(err)), 'Invalid Username or Pass');
        }

        if (!await bcrypt.compare(body.password, user.password)) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!user.validated) {
            throw new Err(403, null, 'User has not confirmed email');
        }

        if (user.disabled) {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        if (!user.mfa_secret) {
            const secret = generateSecret();
            await config.models.User.commit(user.id, {
                mfa_secret: secret
            });
            user.mfa_secret = secret;

            return {
                id: user.id,
                username: user.username,
                access: user.access,
                email: user.email,
                secret
            };
        } else {
            const token = jwt.sign({
                u: user.id
            }, secret, {
                expiresIn: '12h'
            });
            
            return {
                id: user.id,
                username: user.username,
                access: user.access,
                email: user.email,
                token
            };
        }
    }
}
