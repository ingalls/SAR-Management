import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import { AuthAugment } from '../lib/auth.js';
import OAuth from '../lib/oauth.js';
import { sql } from 'drizzle-orm';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { LoginResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/login/oauth', {
        name: 'OAuth Authorize',
        group: 'Login',
        description: 'Return the OAuth2 provider URL to redirect the user to for Single Sign-On',
        res: Type.Object({
            url: Type.String()
        })
    }, async (req, res) => {
        try {
            res.json(await OAuth.authorize(config));
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/login/oauth', {
        name: 'OAuth Callback',
        group: 'Login',
        description: 'Exchange an OAuth2 authorization code for a session token',
        body: Type.Object({
            code: Type.String({ description: 'Authorization code returned by the provider' }),
            state: Type.String({ description: 'State value returned by the provider' })
        }),
        res: LoginResponse
    }, async (req, res) => {
        try {
            const auth = await OAuth.callback(config, req.body);

            config.models.User.commit(auth.id, {
                last_login: sql`Now()`
            });

            res.json({
                id: auth.id,
                username: auth.username,
                email: auth.email,
                access: auth.access,
                token: auth.token,
                iam: await AuthAugment.iam(config.pool, auth.id)
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
