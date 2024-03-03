import fs from 'fs';
import path from 'path';
import cors from 'cors';
import {
    AuthRequest,
    AuthUserType
} from './lib/auth.js';
import express, {
    Request,
    Response,
    NextFunction
} from 'express';
import minify from 'express-minify';
import history from 'connect-history-api-fallback';
import Schema from '@openaddresses/batch-schema';
import { Pool } from '@openaddresses/batch-generic';
import minimist from 'minimist';
import jwt from 'jsonwebtoken';
import Err from '@openaddresses/batch-error';
import { AuthAugment } from './lib/auth.js';
import SwaggerUI from 'swagger-ui-express';
import Models from './lib/models.js';

try {
    const dotfile = new URL('.env', import.meta.url);

    fs.accessSync(dotfile);

    Object.assign(process.env, JSON.parse(String(fs.readFileSync(dotfile))));
} catch (err) {
    console.log('ok - no .env file loaded');
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
    const config = Config.env(args);
    await server(config);
}

/**
 * @apiDefine user User
 *   A user must be logged in to use this endpoint
 */
/**
 * @apiDefine public Public
 *   This API endpoint does not require authentication
 */

export default async function server(config) {
    config.pool = await Pool.connect(process.env.POSTGRES || args.postgres || 'postgres://postgres@localhost:5432/sar', {
        schemas: {
            dir: new URL('./schema', import.meta.url)
        },
        parsing: {
            geometry: true
        }
    });

    config.models = new Models(config.pool);
    config.URL = (await config.models.Server.from('frontend')).value;
    config.APIURL = new URL((await config.models.Server.from('frontend')).value);
    config.OrgName = (await config.models.Server.from('name')).value;

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
        return res.json({
            version: pkg.version
        });
    });

    app.use('/api', schema.router);
    app.use('/docs', express.static('./doc'));

    schema.router.use(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.header('authorization')) {
            const authorization = req.header('authorization').split(' ');

            if (authorization[0].toLowerCase() !== 'bearer') {
                return res.status(401).json({
                    status: 401,
                    message: 'Only "Bearer" authorization header is allowed'
                });
            }

            if (!authorization[1]) {
                return res.status(401).json({
                    status: 401,
                    message: 'No bearer token present'
                });
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.SigningSecret);
                    const user = await config.models.User.from(config.pool, decoded.u)
                    req.auth = {
                        id: user.id,
                        username: user.username,
                        disabled: user.disabled,
                        access: user.access,
                        email: user.email,
                        validated: user.validated,
                        fname: user.fname,
                        lname: user.lname,
                        type: AuthUserType.SESSION,
                        scopes: decoded.scopes || [],
                    };
                } catch (err) {
                    console.error(err);
                    return Err.respond(new Err(401, err, 'Invalid Token'), res);
                }
            }
        } else if (req.query.token) {
            try {
                const decoded = jwt.verify(req.query.token, config.SigningSecret);
                const user = await config.models.User.from(config.pool, decoded.u)
                req.token = {
                    id: user.id,
                    username: user.username,
                    disabled: user.disabled,
                    access: user.access,
                    email: user.email,
                    validated: user.validated,
                    fname: user.fname,
                    lname: user.lname,
                    type: AuthUserType.TOKEN,
                    scopes: decoded.scopes || [],
                };
            } catch (err) {
                console.error(err);
                return Err.respond(new Err(401, err, 'Invalid Token'), res);
            }
        }

        if (req.auth) req.auth.iam = await AuthAugment.iam(config.pool, req.auth.id);
        if (req.token) req.token.iam = await AuthAugment.iam(config.pool, req.token.id);

        return next();
    });


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

    return new Promise((resolve, reject) => {
        const srv = app.listen(4999, () => {
            if (!config.silent) console.log('ok - http://localhost:4999');
            resolve(srv);
        });
    });
}
