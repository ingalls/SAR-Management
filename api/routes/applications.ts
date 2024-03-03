import Err from '@openaddresses/batch-error';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';
import { Application } from '../lib/schema.js';
import { StandardResponse, ApplicationResponse } from '../lib/types.js';
import Auth from '../lib/auth.js';
import Notify from '../lib/notify.js';
import Config from '../lib/config.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export default async function router(schema: any, config: Config) {
    const notify = new Notify(config);

    await schema.get('/application', {
        name: 'Get Applications',
        group: 'Applications',
        auth: 'user',
        description: 'Get all applications',
        query: Type.Object({
            fields: Type.Optional(Type.Array(Type.String({ enum: Object.keys(Application) }))),
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),rder: Type.Optional(Type.Enum(GenericListOrder)),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Application)})),
            filter: Type.Optional(Type.String({ default: '' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ApplicationResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            const list = await config.models.Application.list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`
                    name ~* ${req.query.filter}
                `
            });
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
        body: Type.Any(),
        res: ApplicationResponse
    }, async (req, res) => {
        try {
            const schema = JSON.parse((await config.models.Server.from('application')).value);

            const isValid = ajv.validate(schema, req.body);
            if (!isValid) return Err.respond(new Err(400, null, 'Validation Error'), res, ajv.errors);

            const input: any = {
                schema,
                meta: {}
            };
            for (const prop in req.body) {
                if (['name', 'phone', 'email'].includes(prop)) {
                    input[prop] = req.body[prop];
                } else {
                    input.meta[prop] = req.body[prop];
                }
            }

            const app = await config.models.Application.generate(input);

            res.json(app);

            await notify.users('Application', 'View', {
                text: 'A new application has been submitted',
                url: `application/${app.id}`
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/application/:applicationid', {
        name: 'Get Application',
        group: 'Applications',
        auth: 'user',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Return an application',
        res: Type.Unknown()
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:View');

            const app = await config.models.Application.from(req.params.applicationid);
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
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Modify an application',
        body: Type.Any(),
        res: Type.Any()
    }, async (req, res) => {
        try {
            const schema = JSON.parse((await config.models.Server.from('application')).value);

            const isValid = ajv.validate(schema, req.body);
            if (!isValid) return Err.respond(new Err(400, null, 'Validation Error'), res, ajv.errors);

            const input = {
                schema,
                meta: {}
            };
            for (const prop in req.body) {
                if (['name', 'phone', 'email'].includes(prop)) {
                    input[prop] = req.body[prop];
                } else {
                    input.meta[prop] = req.body[prop];
                }
            }

            const app = await config.models.Application.from(req.params.applicationid);
            Object.assign(app, app.meta);
            delete app.meta;
            return res.json(app);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/application/:applicationid', {
        name: 'Delete Application',
        group: 'Applications',
        auth: 'user',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Delete an application',
        res: StandardResponse
    }, async (req, res) => {
        try {
            await Auth.is_iam(req, 'Application:Admin');

            await config.models.Application.delete(req.params.applicationid);

            return res.json({
                status: 200,
                message: 'Application Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
