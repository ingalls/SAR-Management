import Err from '@openaddresses/batch-error';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './types/user.js';
import UserReset from './types/user_reset.js';
import { InferSelectModel } from 'drizzle-orm';
import { Pool } from '@openaddresses/batch-generic';
import * as pgtypes from './schema.js';

/**
 * @class
 */
export default class Login {
    /**
     * Verify a password reset token
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {String}  token           Password reset token
     */
    static async verify(pool: Pool<typeof pgtypes>, token): Promise<InferSelectModel<typeof User>> {
        if (!token) throw new Err(400, null, 'token required');

        const reset = await UserReset.from(pool, token, 'verify');
        await UserReset.delete_all(pool, reset.uid);

        const user = await User.from(pool, reset.uid);

        if (user.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        return await user.commit({
            validated: true
        });
    }

    static async reset(pool: Pool<typeof pgtypes>, body): Promise<InferSelectModel<typeof User>> {
        if (!body.token) throw new Err(400, null, 'token required');
        if (!body.password) throw new Err(400, null, 'password required');

        const reset = await UserReset.from(pool, body.token, 'reset');
        await UserReset.delete_all(pool, reset.uid);

        const user = await User.from(pool, reset.uid);

        if (user.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        return await user.commit({
            validated: true,
            password: await bcrypt.hash(body.password, 10)
        });
    }

    /**
     * Given a username or email, generate a password reset or validation email
     *
     * @param {Pool}    pool            Instantiated Postgres Pool
     * @param {string}  username        username or email to reset
     * @param {string}  [action=reset]  'reset' or 'verify'
     */
    static async forgot(pool: Pool<typeof pgtypes>, username, action = 'reset'): Promise<{
        uid: number;
        username: string;
        email: string;
        token: string;
    }> {
        if (!username || !username.length) throw new Err(400, null, 'username must not be empty');

        const u = await User.from_username(pool, username.toLowerCase());
        await UserReset.delete_all(pool, u.id);

        if (u.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        const reset = await UserReset.generate(pool, u.id, action);

        return {
            uid: u.id,
            username: u.username,
            email: u.email,
            token: reset.token
        };
    }

    static async attempt(pool, body, secret): Promise<{
        id: number;
        username: string;
        access: string;
        email: string;
        token: string;
    }> {
        if (!body.username) throw new Err(400, null, 'username required');
        if (!body.password) throw new Err(400, null, 'password required');

        const user = await User.from_username(pool, body.username);

        if (!await bcrypt.compare(body.password, user.password)) {
            throw new Err(403, null, 'Invalid Username or Pass');
        }

        if (!user.validated) {
            throw new Err(403, null, 'User has not confirmed email');
        }

        if (user.disabled) {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

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