import fs from 'fs';
import path from 'path';
import cors from 'cors';
import minify from 'express-minify';
import history from 'connect-history-api-fallback';
import express from 'express';
import Schema from '@openaddresses/batch-schema';
import minimist from 'minimist';
import SwaggerUI from 'swagger-ui-express';

try {
    const dotfile = new URL('.env', import.meta.url);

    fs.accessSync(dotfile);

    Object.assign(process.env, JSON.parse(String(fs.readFileSync(dotfile))));
} catch (err) {
    console.log(`ok - no .env file loaded: ${err}`);
}

import Config from './lib/config.js';

const pkg = JSON.parse(String(fs.readFileSync(new URL('./package.json', import.meta.url))));

const args = minimist(process.argv, {
    boolean: ['help', 'silent'],
    string: ['postgres']
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

if (import.meta.url === `file://${process.argv[1]}`) {
    await server();
}

/**
 * @apiDefine user User
 *   A user must be logged in to use this endpoint
 */
/**
 * @apiDefine public Public
 *   This API endpoint does not require authentication
 */

export default async function server() {
    const config = await Config.env(args);

    const app = express();

    const schema = new Schema(express.Router(), {
        logging: true,
        limit: 50
    });

    app.disable('x-powered-by');
    app.use(cors({
        origin: true,
        allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization', 'x-requested-with'],
        credentials: true
    }));

    app.use(minify());

    /**
     * @api {get} /api Get Metadata
     * @apiVersion 1.0.0
     * @apiName Server
     * @apiGroup Server
     * @apiPermission public
     *
     * @apiDescription
     *     Return basic metadata about server configuration
     *
     * @apiSchema {jsonschema=./schema/res.Server.json} apiSuccess
     */
    app.get('/api', (req, res) => {
        res.json({
            version: pkg.version
        });
    });

    app.use('/api', schema.router);
    app.use('/docs', express.static('./doc'));



    await schema.api();

    await schema.load(
        new URL('./routes/', import.meta.url),
        config,
        {
            silent: !!config.silent
        }
    );

    app.use('/docs', SwaggerUI.serve, SwaggerUI.setup(schema.docs.base));

    app.use(history({
        rewrites: [{
            from: /.*\/js\/.*$/,
            to: function(context) {
                return context.parsedUrl.pathname.replace(/.*\/js\//, '/js/');
            }
        },{
            from: /.*$/,
            to: function(context) {
                const parse = path.parse(context.parsedUrl.path);
                if (parse.ext) {
                    return context.parsedUrl.pathname;
                } else {
                    return '/';
                }
            }
        }]
    }));

    app.use(express.static('web/dist'));

    return new Promise((resolve) => {
        const srv = app.listen(4999, () => {
            if (!config.silent) console.log('ok - http://localhost:4999');
            resolve(srv);
        });
    });
}
