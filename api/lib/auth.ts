import Err from '@openaddresses/batch-error';
import { InferSelectModel } from 'drizzle-orm';
import { Request } from 'express';
import { User } from './schema.js';
import { sql } from 'slonik';

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
    iam?: object;
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

export interface AuthRequest extends Request {
    token?: AuthUser;
    auth?: AuthUser;
}

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
};

class AuthAugment {
    static async iam(pool, userid) {
        if (!userid) return {};

        try {
            const pgiam = await pool.query(sql`
                SELECT
                    iam
                FROM
                    users_to_teams
                        LEFT JOIN teams
                            ON tid = teams.id
                WHERE
                    uid = ${userid};
            `);

            const iam = {};
            for (const iamrow of pgiam.rows) {
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
            throw new Err(500, err, 'Server failed to get authentication levels');
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
    static async is_auth(req: AuthRequest, token = false): Promise<boolean> {
        if (token && req.token) req.auth = req.token;

        if (!req.auth || !req.auth.access || !['session', 'token'].includes(req.auth.type)) {
            throw new Err(403, null, 'Authentication Required');
        }

        if (req.auth.disabled) {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    static async is_own_or_iam(req: AuthRequest, uid, permission): Promise<Boolean> {
        await Auth.is_auth(req);

        // Admins will be admins
        if (req.auth && req.auth.access && req.auth.access === 'admin') return true;
        if (req.auth.id === uid) return true;

        await this.is_iam(req, permission);

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    // Ensure IAM permission is at least permission
    static async is_iam(req: AuthRequest, permission): Promise<boolean> {
        await Auth.is_auth(req);

        // Admins will be admins
        if (req.auth && req.auth.access && req.auth.access === 'admin') return true;

        const iam = permission.split(':');
        if (
            req.auth.iam
            && iam.length === 2
            && req.auth.iam[iam[0]]
            && Permissions[iam[0]].indexOf(iam[1]) >= Permissions[iam[0]].indexOf(req.auth.iam[iam[0]])
        ) {
            return true;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    // Ensure Scope Of token is respected
    static async is_scope(req: AuthRequest, scopes): Promise<boolean> {
        await Auth.is_auth(req);

        for (const scope of scopes) {
            const { pathname } = new URL(req.url, 'https://fake.com');

            if (pathname === scope) return true;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    static async is_admin(req: AuthRequest): Promise<boolean> {
        if (!req.auth || !req.auth.access || req.auth.access !== 'admin') {
            throw new Err(403, null, 'Admin token required');
        }

        return true;
    }
}

export {
    AuthAugment,
    Permissions
};
