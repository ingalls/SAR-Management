import Modeler from '@openaddresses/batch-generic';
import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth, { AuthAugment } from '../lib/auth.js';
import Login from '../lib/login.js';
import Email from '../lib/email.js';
import { sql } from 'slonik';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, LoginResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    const email = new Email(config);

    await schema.get('/login', {
        name: 'Session Info',
        group: 'Login',
        description: 'Return information about the currently logged in user',
        res: LoginResponse
    }, async (req, res) => {
        try {
            const auth = await Auth.is_auth(config, req);

            res.json({
                id: auth.id,
                username: auth.username,
                email: auth.email,
                access: auth.access,
                validated: auth.validated,
                iam: auth.iam
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login', {
        name: 'Create Session',
        group: 'Login',
        description: 'Log a user into the service and create an auth cookie',
        body: Type.Object({
            username: Type.String({
                "minLength": 2,
                "maxLength": 40, 
                "description": "username"
            }),
            password: Type.String({
                "minLength": 8,
                "description": "password"
            })
        }),
        res: LoginResponse
    }, async (req, res) => {
        try {
            const auth = await Login.attempt(config.pool, {
                username: req.body.username.toLowerCase(),
                password: req.body.password
            }, config.SigningSecret);

            config.models.User.commit(auth.id, {
                last_login: sql`Now()`
            });

            return res.json({
                id: auth.id,
                username: auth.username,
                email: auth.email,
                access: auth.access,
                token: auth.token,
                iam: await AuthAugment.iam(config.pool, auth.id)
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/verify', {
        name: 'Verify User',
        group: 'Login',
        description: 'Email verification of a new user',
        body: Type.Object({
            token: Type.String({ "description": "The validation token which was emailed to you" })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Login.verify(config, req.body.token);

            return res.json({
                status: 200,
                message: 'User Verified'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/forgot', {
        name: 'Forgot Login',
        group: 'Login',
        description: 'If a user has forgotten their password, send a password reset link to their email',
        body: Type.Object({
            username: Type.String({ "description": "username or email to reset password of" })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            const reset = await Login.forgot(config.pool, req.body.username); // Username or email

            if (config.email) {
                await email.forgot(reset);
            }

            // To avoid email scraping - this will always return true, regardless of success
            return res.json({
                status: 200,
                message: 'Password Email Sent'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/reset', {
        name: 'Reset Login',
        group: 'Login',
        description: 'Once a user has obtained a password reset by email via the Forgot Login API, use the token to reset the password',
        body: Type.Object({
            token: Type.String({ "description": "Email provided reset token" }),
            password: Type.String({ "description": "The new user password" })
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Login.reset(config.pool, {
                token: req.body.token,
                password: req.body.password
            });

            return res.json({
                status: 200,
                message: 'User Reset'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
