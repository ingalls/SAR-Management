import Err from '@openaddresses/batch-error';
import Cert from '../lib/types/cert.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/user/:userid/cert', {
        name: 'Get Certs',
        group: 'Cert',
        auth: 'user',
        description: 'Get all certs for the given user',
        ':userid': 'integer',
        query: 'req.query.ListCerts.json',
        res: 'res.ListCerts.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:View');

            res.json(await Cert.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user/:userid/cert', {
        name: 'Create Certs',
        group: 'Cert',
        auth: 'user',
        description: 'Create a new Certificate',
        ':userid': 'integer',
        body: 'req.body.CreateCert.json',
        res: 'certs.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'User:View');

            const cert = await Cert.generate(config.pool, {
                uid: req.auth.id,
                ...req.body
            });

            res.json(cert);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
