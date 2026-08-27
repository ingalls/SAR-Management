import Err from '@openaddresses/batch-error';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sql } from 'drizzle-orm';
import Config from './config.js';

export type OAuthSettings = {
    enabled: boolean;
    name: string;
    client_id: string;
    client_secret: string;
    authorize_url: string;
    token_url: string;
    userinfo_url: string;
    scopes: string;
};

/**
 * Generic OAuth2 (Authorization Code) Single Sign-On.
 *
 * All provider details are stored in the `server` key/value table and
 * managed by an admin via the Server Settings UI.
 */
export default class OAuth {
    static async settings(config: Config): Promise<OAuthSettings> {
        const get = async (key: string): Promise<string> => {
            try {
                return (await config.models.Server.from(key)).value;
            } catch {
                return '';
            }
        };

        const enabled = await get('oauth_enabled');

        return {
            enabled: enabled === 'true' || (enabled as unknown) === true,
            name: (await get('oauth_name')) || 'Single Sign-On',
            client_id: await get('oauth_client_id'),
            client_secret: await get('oauth_client_secret'),
            authorize_url: await get('oauth_authorize_url'),
            token_url: await get('oauth_token_url'),
            userinfo_url: await get('oauth_userinfo_url'),
            scopes: (await get('oauth_scopes')) || 'openid email profile'
        };
    }

    static redirectURI(config: Config): string {
        return new URL('/login', config.URL).toString();
    }

    /**
     * Ensure SSO is enabled & fully configured, otherwise throw
     */
    static async ready(config: Config): Promise<OAuthSettings> {
        const settings = await OAuth.settings(config);

        if (!settings.enabled) throw new Err(400, null, 'Single Sign-On is not enabled');

        for (const key of ['client_id', 'client_secret', 'authorize_url', 'token_url', 'userinfo_url'] as const) {
            if (!settings[key]) throw new Err(400, null, `Single Sign-On is not fully configured: missing ${key}`);
        }

        return settings;
    }

    /**
     * Build the URL to redirect the user to for authorization
     */
    static async authorize(config: Config): Promise<{ url: string }> {
        const settings = await OAuth.ready(config);

        // Signed, short lived state to protect against CSRF
        const state = jwt.sign({ oauth: true }, config.SigningSecret, { expiresIn: '10m' });

        const url = new URL(settings.authorize_url);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', settings.client_id);
        url.searchParams.set('redirect_uri', OAuth.redirectURI(config));
        url.searchParams.set('scope', settings.scopes);
        url.searchParams.set('state', state);

        return { url: url.toString() };
    }

    /**
     * Exchange an authorization code for a session token
     */
    static async callback(config: Config, body: { code: string; state: string }): Promise<{
        id: number;
        username: string;
        access: string;
        email: string;
        token: string;
    }> {
        const settings = await OAuth.ready(config);

        try {
            const decoded = jwt.verify(body.state, config.SigningSecret) as JwtPayload;
            if (!decoded.oauth) throw new Error('Invalid state');
        } catch (err) {
            throw new Err(403, err instanceof Error ? err : new Error(String(err)), 'Invalid or expired OAuth state');
        }

        // Exchange code for an access token
        let access_token: string;
        try {
            const tokenRes = await fetch(settings.token_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${settings.client_id}:${settings.client_secret}`).toString('base64')
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: body.code,
                    redirect_uri: OAuth.redirectURI(config),
                    client_id: settings.client_id,
                    client_secret: settings.client_secret
                })
            });

            if (!tokenRes.ok) throw new Error(`Token endpoint returned ${tokenRes.status}`);

            const token = await tokenRes.json() as { access_token?: string };
            if (!token.access_token) throw new Error('Token endpoint did not return an access_token');
            access_token = token.access_token;
        } catch (err) {
            throw new Err(502, err instanceof Error ? err : new Error(String(err)), 'Failed to exchange OAuth code');
        }

        // Fetch the user profile
        let email: string | undefined;
        try {
            const infoRes = await fetch(settings.userinfo_url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (!infoRes.ok) throw new Error(`UserInfo endpoint returned ${infoRes.status}`);

            const info = await infoRes.json() as Record<string, unknown>;
            email = OAuth.extractEmail(info);
            if (!email) throw new Error('UserInfo did not include an email address');
        } catch (err) {
            throw new Err(502, err instanceof Error ? err : new Error(String(err)), 'Failed to retrieve OAuth user profile');
        }

        // Map to an existing local user by email - SSO never creates accounts
        let user;
        try {
            user = await config.models.User.from(sql`Lower(email) = ${email.toLowerCase()}`);
        } catch (err) {
            throw new Err(403, err instanceof Error ? err : new Error(String(err)), 'No account is associated with this email address');
        }

        if (user.disabled) throw new Err(403, null, 'Account Disabled - Please Contact Us');

        if (!user.validated) {
            await config.models.User.commit(user.id, { validated: true });
        }

        const token = jwt.sign({ u: user.id }, config.SigningSecret, { expiresIn: '12h' });

        return {
            id: user.id,
            username: user.username,
            access: user.access,
            email: user.email,
            token
        };
    }

    /**
     * Providers vary in how they report email - support the common shapes
     */
    static extractEmail(info: Record<string, unknown>): string | undefined {
        if (typeof info.email === 'string') return info.email;
        if (typeof info.mail === 'string') return info.mail;
        if (typeof info.upn === 'string') return info.upn;
        if (typeof info.preferred_username === 'string' && info.preferred_username.includes('@')) return info.preferred_username;

        if (Array.isArray(info.emails)) {
            for (const e of info.emails) {
                if (typeof e === 'string') return e;
                if (e && typeof e === 'object' && typeof (e as { email?: unknown }).email === 'string') return (e as { email: string }).email;
                if (e && typeof e === 'object' && typeof (e as { value?: unknown }).value === 'string') return (e as { value: string }).value;
            }
        }

        return undefined;
    }
}
