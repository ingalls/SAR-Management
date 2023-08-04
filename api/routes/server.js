import Err from '@openaddresses/batch-error';
import Server from '../lib/types/server.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.post('/server', {
        name: 'Create Meta',
        group: 'Server',
        auth: 'admin',
        description: 'Create a new Server Metadata Record',
        body: 'req.body.CreateServer.json',
        res: 'server.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(res);

            const server = await Server.generate(config.pool, req.body);

            return res.json(server);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/server/:key', {
        name: 'Get Meta',
        group: 'Server',
        auth: 'admin',
        description: 'Get Server Metadata by key',
        ':key': 'string',
        res: 'server.json'
    }, async (req, res) => {
        try {
            const server = await Server.from(config.pool, req.params.key);

            if (server.public) return res.json(server);

            await Auth.is_auth(req);

            return res.json(server);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/server/:key', {
        name: 'Patch Meta',
        group: 'Server',
        auth: 'admin',
        description: 'Patch Server Metadata by key',
        ':key': 'string',
        body: 'req.body.PatchServer.json',
        res: 'server.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const server = await Server.from(config.pool, req.params.key);

            await server.commit(req.body);

            return res.json(server);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
    await schema.delete('/server/:key', {
        name: 'Delete Meta',
        group: 'Server',
        auth: 'admin',
        description: 'Delete Server Metadata by key',
        ':key': 'string',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const server = await Server.from(config.pool, req.params.key);

            await server.delete(req.body);

            return res.json({
                status: 200,
                message: 'Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
