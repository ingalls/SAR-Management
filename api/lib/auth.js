import Err from '@openaddresses/batch-error';

const Permissions = {
    Calendar: [ 'View', 'None' ],
    Docs: [ 'Admin', 'Manage', 'View', 'None' ],
    Equipment: [ 'Admin', 'Manage', 'View', 'None' ],
    Issues: [ 'Admin', 'Manage', 'View', 'None' ],
    Leadership: [ 'Admin', 'View', 'None' ],
    Missions: ['Admin', 'Manage', 'View', 'None' ],
    Teams: [ 'Admin', 'Manage', 'View', 'None' ],
    Trainings: ['Admin', 'Manage', 'View', 'None' ],
    User: [ 'Admin', 'ManageOwn', 'View', 'None' ],
};

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

    static async is_own(req, uid) {
        await Auth.is_auth(req);

        // Admins will be admins
        if (req.auth && req.auth.access && req.auth.access === 'admin') return true;

        if (req.auth.id === uid) {
            return true;
        }

        throw new Err(403, null, 'Authentication Level Insufficient');
    }

    static async is_iam(req, permission) {
        await Auth.is_auth(req);

        // Admins will be admins
        if (req.auth && req.auth.access && req.auth.access === 'admin') return true;

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
    Permissions
}
