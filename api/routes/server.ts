import { Type } from '@sinclair/typebox';
import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Schema from '@openaddresses/batch-schema';
import Config from '../lib/config.js';
import { StandardResponse, ServerResponse } from '../lib/types.js';

export default async function router(schema: Schema, config: Config) {
    await schema.put('/server', {
        name: 'Put Meta',
        group: 'Server',
        description: 'Create a new Server Metadata Record',
        body: Type.Object({
            key: Type.String(),
            value: Type.Any(),
            public: Type.Boolean()
        }),
        res: ServerResponse
    }, async (req, res) => {
        try {
            await Auth.is_admin(config, req);

            let server;
            try {
                server = await await config.models.Server.from(req.body.key);
                await server.commit(req.body);
            } catch (err) {
                console.error(err);
                server = await await config.models.Server.generate(req.body);
            }

            res.json(server);
        } catch (err) {
             Err.respond(err, res);
        }
    });

    await schema.get('/server/:key', {
        name: 'Get Meta',
        group: 'Server',
        description: 'Get Server Metadata by key',
        params: Type.Object({
            key: Type.String(),
        }),
        res: ServerResponse
    }, async (req, res) => {
        try {
            const server = await config.models.Server.from(req.params.key);

            if (server.public) {
                res.json(server);
            } else {
                await Auth.is_auth(config, req);

                res.json(server);
            }
        } catch (err) {
             Err.respond(err, res);
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

            res.json({
                status: 200,
                message: 'Deleted'
            });
        } catch (err) {
             Err.respond(err, res);
        }
    });
}
