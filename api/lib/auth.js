import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

const Permissions = {
    Application: ['Admin', 'Manage', 'View', 'None'],
    Calendar: ['View', 'None'],
    Doc: ['Admin', 'Manage', 'View', 'None'],
    Equipment: ['Admin', 'Manage', 'View', 'None'],
    Issue: ['Admin', 'Manage', 'View', 'None'],
    Leadership: ['Admin', 'View', 'None'],
    Mission: ['Admin', 'Manage', 'View', 'None'],
    Team: ['Admin', 'Manage', 'View', 'None'],
    Training: ['Admin', 'Manage', 'View', 'None'],
    User: ['Admin', 'View', 'None'],
    OnCall: ['Admin', 'View', 'None']
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
    static async is_auth(req, token = false) {
        if (token && req.token) req.auth = req.token;

        if (!req.auth || !req.auth.access || !['session', 'token'].includes(req.auth.type)) {
            throw new Err(403, null, 'Authentication Required');
        }

        if (req.auth.disabled) {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        return true;
    }

    static async is_own_or_iam(req, uid, permission) {
        await Auth.is_auth(req);

        // Admins will be admins
        if (req.auth && req.auth.access && req.auth.access === 'admin') return true;
        if (req.auth.id === uid) return true;

        await this.is_iam(req, permission);

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    // Ensure IAM permission is at least permission
    static async is_iam(req, permission) {
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
    static async is_scope(req, scopes) {
        await Auth.is_auth(req);

        for (const scope of scopes) {
            const { pathname } = new URL(req.url, 'https://fake.com');

            if (pathname === scope) return true;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    static async is_admin(req) {
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
