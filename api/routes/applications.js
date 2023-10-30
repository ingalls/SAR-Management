import Err from '@openaddresses/batch-error';
import Application from '../lib/types/application.js';
import Auth, { Permissions } from '../lib/auth.js';
import Server from '../lib/types/server.js';
import Ajv from 'ajv';
import Notify from '../lib/notify.js';

const ajv = new Ajv({ allErrors: true });

export default async function router(schema, config) {
    await schema.get('/application', {
        name: 'Get Applications',
        group: 'Applications',
        auth: 'user',
        description: 'Get all applications',
        query: 'req.query.ListApplications.json',
        res: 'res.ListApplications.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            const list = await Application.list(config.pool, req.query);
            return res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/application', {
        name: 'Submit Application',
        group: 'Applications',
        auth: 'user',
        description: 'Submit a new application for consideration',
        body: { type: 'object' },
        res: 'applications.json'
    }, async (req, res) => {
        try {
            const schema = JSON.parse((await Server.from(config.pool, 'application')).value);

            const isValid = ajv.validate(schema, req.body);
            if (!isValid) return Err.respond(new Err(400, null, 'Validation Error'), res, ajv.errors);

            const input = {
                schema,
                meta: {}
            }
            for (const prop in req.body) {
                if (['name', 'phone', 'email'].includes(prop)) {
                    input[prop] = req.body[prop];
                } else {
                    input.meta[prop] = req.body[prop];
                }
            }

            const app = await Application.generate(config.pool, input);

            return res.json(app)
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/application/:applicationid', {
        name: 'Get Application',
        group: 'Applications',
        auth: 'user',
        ':applicationid': 'integer',
        description: 'Return an application',
        res: { type: 'object' }
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            const app = (await Application.from(config.pool, req.params.applicationid)).serialize();
            Object.assign(app, app.meta);
            delete app.meta;
            return res.json(app);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/application/:applicationid', {
        name: 'Update Application',
        group: 'Applications',
        auth: 'user',
        ':applicationid': 'integer',
        description: 'Modify an application',
        body: { type: 'object' },
        res: { type: 'object' }
    }, async (req, res) => {
        try {
            const schema = JSON.parse((await Server.from(config.pool, 'application')).value);

            const isValid = ajv.validate(schema, req.body);
            if (!isValid) return Err.respond(new Err(400, null, 'Validation Error'), res, ajv.errors);

            const input = {
                schema,
                meta: {}
            }
            for (const prop in req.body) {
                if (['name', 'phone', 'email'].includes(prop)) {
                    input[prop] = req.body[prop];
                } else {
                    input.meta[prop] = req.body[prop];
                }
            }

            const app = (await Application.from(config.pool, req.params.applicationid)).serialize();
            Object.assign(app, app.meta);
            delete app.meta;
            return res.json(app);

            return res.json(app)
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/application/:applicationid', {
        name: 'Delete Application',
        group: 'Applications',
        auth: 'user',
        ':applicationid': 'integer',
        description: 'Delete an application',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:Admin');

            await Application.delete(config.pool, req.params.applicationid);

            return res.json({
                status: 200,
                message: 'Application Deleted'
            })
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
