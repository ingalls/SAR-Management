import Err from '@openaddresses/batch-error';
import Cert from '../lib/types/cert.js';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';

export default async function router(schema: Schema, config: Config) {
    await schema.get('/user/:userid/cert', {
        name: 'Get Certs',
        group: 'Cert',
        description: 'Get all certs for the given user',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        query: 'req.query.ListCerts.json',
        res: 'res.ListCerts.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            res.json(await Cert.list(config.pool, {
                uid: req.params.userid,
                ...req.query
            }));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/user/:userid/cert/:certid', {
        name: 'Get Certs',
        group: 'Cert',
        description: 'Get all certs for the given user',
        params: Type.Object({
            userid: Type.Integer(),
            certid: Type.Integer()
        }),
        res: 'certs.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

            const cert = await Cert.from(config.pool, req.params.certid);
            if (cert.uid !== req.params.userid) throw new Err(400, null, 'Mismatch between UserID and Cert');

            return res.json(cert);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user/:userid/cert', {
        name: 'Create Certs',
        group: 'Cert',
        description: 'Create a new Certificate',
        params: Type.Object({
            userid: Type.Integer(),
        }),
        body: 'req.body.CreateCert.json',
        res: 'certs.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, 'User:View');

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
