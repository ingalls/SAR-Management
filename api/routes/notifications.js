import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import Auth from '../lib/auth.js';
import bcrypt from 'bcrypt';

export default async function router(schema, config) {
    await schema.get('/notification', {
        name: 'Get Notifications',
        group: 'User',
        auth: 'user',
        description: 'Get all notifications',
        //req: 'req.query.ListUsers.json',
        //res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json({
                total: 0
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
