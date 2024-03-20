import Err from '@openaddresses/batch-error';
import KnownCert from '../lib/types/certs-known.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/certs', {
        name: 'Get Certs',
        group: 'KnownCerts',
        auth: 'user',
        description: 'Get all known certs',
        res: 'res.ListKnownCerts.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            res.json(await KnownCert.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
