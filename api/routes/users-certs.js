import Err from '@openaddresses/batch-error';
import Cert from '../lib/types/cert.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/user/:userid/certs', {
        name: 'Get Certs',
        group: 'Cert',
        auth: 'user',
        description: 'Get all certs for the given user',
        ':userid': 'integer',
        req: 'req.query.ListCerts.json',
        res: 'res.ListCerts.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Users:View');

            res.json(await Cert.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
