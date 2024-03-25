import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.put('/server', {
        name: 'Put Meta',
        group: 'Server',
        description: 'Create a new Server Metadata Record',
        body: 'req.body.CreateServer.json',
        res: 'server.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            let server;
            try {
                server = await await config.models.Server.from(req.body.key);
                await server.commit(req.body);
            } catch (err) {
                server = await await config.models.Server.generate(req.body);
            }

            return res.json(server);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/server/:key', {
        name: 'Get Meta',
        group: 'Server',
        description: 'Get Server Metadata by key',
        params: Type.Object({
            key: Type.String(),
        }),
        res: 'server.json'
    }, async (req, res) => {
        try {
            const server = await config.models.Server.from(req.params.key);

            if (server.public) return res.json(server);

            await Auth.is_auth(config, req);

            return res.json(server);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/server/:key', {
        name: 'Delete Meta',
        group: 'Server',
        description: 'Delete Server Metadata by key',
        params: Type.Object({
            key: Type.String(),
        }),
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            await config.models.Server.delete(req.params.key);

            return res.json({
                status: 200,
                message: 'Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
