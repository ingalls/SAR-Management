import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { Pool } from '@openaddresses/batch-generic';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import Config from './config.js';
import { Request } from 'express';
import * as pgschema from './schema.js';

export enum PermissionsLevel {
    ADMIN = 'Admin',
    MANAGE = 'Manage',
    VIEW = 'View',
    NONE = 'None'
}

export enum AuthUserType {
    SESSION = 'session',
    TOKEN = 'token'
}

export type AuthUser = {
    iam: object;
    scopes: Array<string>;
    type: AuthUserType;
    id: number;
    access: string;
    disabled: boolean;
    fname: string;
    lname: string;
    username: string;
    email: string;
    validated: boolean;
};

const Permissions = {
    Application: [PermissionsLevel.ADMIN, PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Calendar: [PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Doc: [PermissionsLevel.ADMIN, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Equipment: [PermissionsLevel.ADMIN, PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Issue: [PermissionsLevel.ADMIN,  PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Leadership: [PermissionsLevel.ADMIN, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Mission: [PermissionsLevel.ADMIN, PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Team: [PermissionsLevel.ADMIN, PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    Training: [PermissionsLevel.ADMIN, PermissionsLevel.MANAGE, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    User: [PermissionsLevel.ADMIN, PermissionsLevel.VIEW, PermissionsLevel.NONE],
    OnCall: [PermissionsLevel.ADMIN, PermissionsLevel.VIEW, PermissionsLevel.NONE]
}

export const Iam = Type.Object({
    Application: Type.Optional(Type.Enum(PermissionsLevel)),
    Calendar: Type.Optional(Type.Enum(PermissionsLevel)),
    Doc: Type.Optional(Type.Enum(PermissionsLevel)),
    Equipment: Type.Optional(Type.Enum(PermissionsLevel)),
    Issue: Type.Optional(Type.Enum(PermissionsLevel)),
    Leadership: Type.Optional(Type.Enum(PermissionsLevel)),
    Mission: Type.Optional(Type.Enum(PermissionsLevel)),
    Team: Type.Optional(Type.Enum(PermissionsLevel)),
    Training: Type.Optional(Type.Enum(PermissionsLevel)),
    User: Type.Optional(Type.Enum(PermissionsLevel)),
    OnCall: Type.Optional(Type.Enum(PermissionsLevel)),
});

class AuthAugment {
    static async iam(pool: Pool<typeof pgschema>, userid: number) {
        if (!userid) return {};

        try {
            const pgiam = await pool
                .select({ iam: pgschema.Team.iam })
                .from(pgschema.UserTeam)
                .leftJoin(pgschema.Team, eq(pgschema.UserTeam.tid, pgschema.Team.id))
                .where(eq(pgschema.UserTeam.uid, userid))

            const iam = {};
            for (const iamrow of pgiam) {
                const i = iamrow.iam;
                for (const group in i) {
                    if (!iam[group]) {
                        iam[group] = i[group];
                    } else if (Permissions[group] && Permissions[group].indexOf(iam[group]) > Permissions[group].indexOf(i[group])) {
                        iam[group] = i[group];
                    }
                }
            }

            for (const group in Permissions) {
                if (!iam[group]) iam[group] = Permissions[group][Permissions[group].length - 1];
            }

            return iam;
        } catch (err) {
            console.error(err);
            throw new Err(500, err instanceof Error ? err : new Error(String(err)), 'Server failed to get authentication levels');
        }
    }
}

/**
 * @class
 */
export default class Auth {
    /**
     * Is the user authenticated
     *
     * @param {Object} req Express Request
     * @param {boolean} token Should URL query tokens be allowed (usually only for downloads)
     */
    static async is_auth(config: Config, req: Request<any, any, any, any>, opts: {
        token?: boolean;
    } = {}): Promise<AuthUser> {
        if (!opts.token) opts.token = false;

        const auth = await this.#parse(config, req, { token: opts.token });

        if (!auth || !auth.access || !['session', 'token'].includes(auth.type)) {
            throw new Err(403, null, 'Authentication Required');
        }

        if (auth.disabled) {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return auth;
    }

    static async is_own_or_iam(config: Config, req: Request<any, any, any, any>, uid, permission): Promise<AuthUser> {
        const auth = await Auth.is_auth(config, req);

        // Admins will be admins
        if (auth && auth.access && auth.access === 'admin') return auth;
        if (auth.id === uid) return auth;

        return await this.is_iam(config, req, permission);
    }

    // Ensure IAM permission is at least permission
    static async is_iam(config: Config, req: Request<any, any, any, any>, permission: string, opts: {
        token: boolean
    } = { token: false }): Promise<AuthUser> {
        const auth = await Auth.is_auth(config, req, opts);

        // Admins will be admins
        if (auth && auth.access && auth.access === 'admin') return auth;

        const iam = permission.split(':');
        if (
            auth.iam
            && iam.length === 2
            && auth.iam[iam[0]]
            && Permissions[iam[0]].indexOf(iam[1]) >= Permissions[iam[0]].indexOf(auth.iam[iam[0]])
        ) {
            return auth;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    // Ensure Scope Of token is respected
    static async is_scope(config: Config, req: Request<any, any, any, any>, scopes, opts: {
        token: boolean
    } = { token: false }): Promise<AuthUser> {
        const auth = await Auth.is_auth(config, req, opts);

        for (const scope of scopes) {
            const { pathname } = new URL(req.url, 'https://fake.com');

            if (pathname === scope) return auth;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    static async is_admin(config: Config, req: Request<any, any, any, any>): Promise<AuthUser> {
        const auth = await Auth.is_auth(config, req);

        if (!auth || !auth.access || auth.access !== 'admin') {
            throw new Err(403, null, 'Admin token required');
        }

        return auth;
    }

    static async #parse(config: Config, req: Request<any, any, any, any>, opts: {
        token: boolean
    } = { token: false }): Promise<AuthUser> {
        if (req.header('authorization')) {
            const authorization = (req.header('authorization') || '').split(' ');

            if (!authorization[0] || authorization[0].toLowerCase() !== 'bearer') {
                throw new Err(401, null, 'Only "Bearer" authorization header is allowed')
            }

            if (!authorization[1]) {
                throw new Err(401, null, 'No bearer token present');
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.SigningSecret);
                    const user = await config.models.User.from(decoded.u)

                    return {
                        id: user.id,
                        username: user.username,
                        disabled: user.disabled,
                        access: user.access,
                        email: user.email,
                        validated: user.validated,
                        fname: user.fname,
                        lname: user.lname,
                        type: AuthUserType.SESSION,
                        scopes: decoded.scopes || [],
                        iam: await AuthAugment.iam(config.pool, user.id)
                    };
                } catch (err) {
                    throw new Err(401, err instanceof Error ? err : new Error(String(err)), 'Invalid Token');
                }
            }
        } else if (req.query.token && opts.token) {
            try {
                const decoded = jwt.verify(req.query.token, config.SigningSecret);
                const user = await config.models.User.from(decoded.u)
                return {
                    id: user.id,
                    username: user.username,
                    disabled: user.disabled,
                    access: user.access,
                    email: user.email,
                    validated: user.validated,
                    fname: user.fname,
                    lname: user.lname,
                    type: AuthUserType.TOKEN,
                    scopes: decoded.scopes || [],
                    iam: await AuthAugment.iam(config.pool, user.id)
                };
            } catch (err) {
                throw new Err(401, err instanceof Error ? err : new Error(String(err)), 'Invalid Token');
            }
        } else {
            throw new Err(401, null, 'No Token Present');
        }
    }
}

export {
    AuthAugment,
    Permissions
};
