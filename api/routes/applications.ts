import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox';
import { sql, SQL } from 'drizzle-orm';
import { Application } from '../lib/schema.js';
import { StandardResponse, ApplicationResponse, ApplicationEventResponse } from '../lib/types.js';
import { ApplicationCounts } from '../lib/models/Application.js';
import {
    ApplicationStatus,
    ApplicationStatusOpen,
    ApplicationStatusClosed,
    ApplicationEventType
} from '../lib/application-status.js';
import Auth, { PermissionsLevel, IamGroup, AuthUser } from '../lib/auth.js';
import Notify from '../lib/notify.js';
import Email from '../lib/email.js';
import Config from '../lib/config.js';
import { GenericListOrder } from '@openaddresses/batch-generic';
import Schema from '@openaddresses/batch-schema';
import Ajv, { ErrorObject } from 'ajv';

// Form fields that are stored as first class columns, all others are stored in `answers`
const ColumnFields = ['name', 'phone', 'email'];

const ApplicationDuplicate = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    status: Type.Enum(ApplicationStatus),
    created: Type.String()
});

/**
 * Validate form data against an application form.
 * A new instance is used per call as AJV caches every schema object it is handed
 * and the form is parsed fresh on every request
 */
function validate(schema: unknown, data: unknown): ErrorObject[] | null {
    const ajv = new Ajv({ allErrors: true, strict: false });
    if (ajv.validate(schema as object, data)) return null;
    return ajv.errors || [];
}

function json(value: unknown): SQL<unknown> {
    // The driver double encodes JSON parameters unless they are passed as TEXT
    return sql`${JSON.stringify(value)}::TEXT::JSON`;
}

function like(filter: string): string {
    return '%' + filter.replace(/[\\%_]/g, (c) => `\\${c}`) + '%';
}

function fullname(user: { fname: string; lname: string }): string {
    return `${user.fname} ${user.lname}`.trim();
}

export default async function router(schema: Schema, config: Config) {
    const notify = new Notify(config);
    const email = config.email ? new Email(config) : null;

    async function duplicates(application: { id: number; email: string; phone: string }): Promise<Array<Static<typeof ApplicationDuplicate>>> {
        const list = await config.models.Application.list({
            limit: 25,
            order: GenericListOrder.DESC,
            sort: 'created',
            where: sql`
                id != ${application.id}
                AND (
                    lower(email) = lower(${application.email})
                    OR (
                        length(regexp_replace(${application.phone}, '\\D', '', 'g')) >= 10
                        AND right(regexp_replace(phone, '\\D', '', 'g'), 10) = right(regexp_replace(${application.phone}, '\\D', '', 'g'), 10)
                    )
                )
            `
        });

        return list.items.map((dup) => {
            return {
                id: dup.id,
                name: dup.name,
                status: dup.status as ApplicationStatus,
                created: dup.created
            };
        });
    }

    await schema.get('/application', {
        name: 'Get Applications',
        group: 'Applications',
        description: 'Get all applications',
        query: Type.Object({
            limit: Type.Optional(Type.Integer()),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder)),
            sort: Type.Optional(Type.String({default: 'created', enum: Object.keys(Application)})),
            filter: Type.Optional(Type.String({ default: '', description: 'Filter by applicant name, email or phone' })),
            status: Type.Optional(Type.String({
                default: 'active',
                description: 'A single status or one of the groupings: active (still in progress), inactive (has an outcome), all',
                enum: ['active', 'inactive', 'all', ...Object.values(ApplicationStatus)]
            })),
            cohort: Type.Optional(Type.String({ description: 'Limit to a single cohort' })),
            assigned: Type.Optional(Type.Integer({ description: 'Limit to applications assigned to the given user id' }))
        }),
        res: Type.Object({
            total: Type.Integer(),
            counts: ApplicationCounts,
            cohorts: Type.Array(Type.String()),
            items: Type.Array(ApplicationResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.VIEW);

            const filter = like(req.query.filter || '');
            const status = req.query.status || 'active';

            let statuses: string[] = [status];
            if (status === 'active') statuses = ApplicationStatusOpen;
            else if (status === 'inactive') statuses = ApplicationStatusClosed;
            else if (status === 'all') statuses = Object.values(ApplicationStatus);

            // Everything except the status, so that per status counts reflect the other filters
            const base = sql`
                (name ILIKE ${filter} OR email ILIKE ${filter} OR phone ILIKE ${filter})
                AND (${req.query.cohort ?? null}::TEXT IS NULL OR cohort = ${req.query.cohort ?? null}::TEXT)
                AND (${req.query.assigned ?? null}::INT IS NULL OR assigned = ${req.query.assigned ?? null}::INT)
            `;

            const list = await config.models.Application.augmented_list({
                limit: req.query.limit,
                page: req.query.page,
                order: req.query.order,
                sort: req.query.sort,
                where: sql`${base} AND status IN ${statuses}`
            });

            const cohorts = await config.pool
                .selectDistinct({ cohort: Application.cohort })
                .from(Application)
                .orderBy(Application.cohort);

            res.json({
                ...list,
                counts: await config.models.Application.counts(base),
                cohorts: cohorts.map((c) => c.cohort)
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.post('/application', {
        name: 'Submit Application',
        group: 'Applications',
        description: `
            Submit a new application for consideration

            This is the only unauthenticated application route. The body must match the
            application form returned by GET /api/server/application. Lifecycle fields
            (status, cohort, reviewer) cannot be set by applicants - a cohort is only
            honoured when the request is made by a user who can manage applications.
        `,
        body: Type.Record(Type.String(), Type.Unknown()),
        res: ApplicationResponse
    }, async (req, res) => {
        try {
            // Reviewers can enter paper applications on behalf of an applicant
            let reviewer: AuthUser | null = null;
            try {
                reviewer = await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.MANAGE);
            } catch {
                reviewer = null;
            }

            const body: Record<string, unknown> = { ...req.body };

            // Lifecycle fields are never part of the form
            const cohort = reviewer && typeof body.cohort === 'string' && body.cohort.trim() ? body.cohort.trim() : 'unassigned';
            for (const prop of ['id', 'created', 'updated', 'status', 'cohort', 'group', 'assigned', 'user_id', 'agency_id', 'schema', 'answers']) {
                delete body[prop];
            }

            const form = JSON.parse((await config.models.Server.from('application')).value);

            const errors = validate(form, body);
            if (errors) {
                return Err.respond(new Err(400, null, 'Validation Error'), res, errors);
            }

            const answers: Record<string, unknown> = {};
            for (const prop in body) {
                if (!ColumnFields.includes(prop)) answers[prop] = body[prop];
            }

            for (const prop of ColumnFields) {
                if (typeof body[prop] !== 'string' || !(body[prop] as string).trim()) {
                    throw new Err(400, null, `${prop} is required`);
                }
            }

            const created = await config.models.Application.generate({
                status: ApplicationStatus.SUBMITTED,
                cohort,
                name: (body.name as string).trim(),
                phone: (body.phone as string).trim(),
                email: (body.email as string).trim().toLowerCase(),
                answers: json(answers),
                schema: json(form)
            });

            const dups = await duplicates(created);

            await config.models.ApplicationEvent.record({
                application: created.id,
                author: reviewer ? reviewer.id : null,
                type: ApplicationEventType.CREATED,
                meta: {
                    source: reviewer ? 'reviewer' : 'public',
                    duplicates: dups.map((dup) => dup.id)
                }
            });

            res.json(await config.models.Application.augmented_from(created.id));

            // Anything past this point must not fail the submission
            try {
                if (email && !reviewer) {
                    await email.application_received(created);

                    await config.models.ApplicationEvent.record({
                        application: created.id,
                        type: ApplicationEventType.EMAIL,
                        body: 'Application received confirmation'
                    });
                }
            } catch (err) {
                console.error(err);
            }

            await notify.users('Application', PermissionsLevel.VIEW, {
                text: dups.length
                    ? `A new application has been submitted by ${created.name} (possible duplicate)`
                    : `A new application has been submitted by ${created.name}`,
                url: `application/${created.id}`
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.get('/application/:applicationid', {
        name: 'Get Application',
        group: 'Applications',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Return an application',
        res: Type.Composite([ApplicationResponse, Type.Object({
            duplicates: Type.Array(ApplicationDuplicate, {
                description: 'Other applications that share an email or phone number'
            })
        })])
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.VIEW);

            const app = await config.models.Application.augmented_from(req.params.applicationid);

            res.json({
                ...app,
                duplicates: await duplicates(app)
            });
        } catch (err) {
            Err.respond(err, res);
        }
    });

    await schema.patch('/application/:applicationid', {
        name: 'Update Application',
        group: 'Applications',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: `
            Modify an application

            Changes to the status, cohort, reviewer or linked member are each
            recorded in the application timeline
        `,
        body: Type.Object({
            name: Type.Optional(Type.String()),
            phone: Type.Optional(Type.String()),
            email: Type.Optional(Type.String()),
            answers: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
            status: Type.Optional(Type.Enum(ApplicationStatus)),
            note: Type.Optional(Type.String({ description: 'Reason recorded alongside a status change' })),
            cohort: Type.Optional(Type.String()),
            assigned: Type.Optional(Type.Union([Type.Null(), Type.Integer()])),
            user_id: Type.Optional(Type.Union([Type.Null(), Type.Integer()]))
        }),
        res: ApplicationResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.MANAGE);

            const app = await config.models.Application.augmented_from(req.params.applicationid);
            const url = `application/${app.id}`;

            const input: Record<string, unknown> = {};
            const events: Array<{ type: ApplicationEventType; body?: string; meta: Record<string, unknown> }> = [];
            const notifications: Array<{ uid: number; text: string }> = [];

            // Applicant details & answers
            const edited: string[] = [];
            for (const prop of ColumnFields as Array<'name' | 'phone' | 'email'>) {
                let value = req.body[prop];
                if (value === undefined) continue;
                value = prop === 'email' ? value.trim().toLowerCase() : value.trim();
                if (!value) throw new Err(400, null, `${prop} cannot be empty`);
                if (value === app[prop]) continue;
                input[prop] = value;
                edited.push(prop);
            }

            if (req.body.answers !== undefined) {
                const keys = new Set([...Object.keys(app.answers), ...Object.keys(req.body.answers)]);
                for (const key of keys) {
                    if (JSON.stringify(app.answers[key]) !== JSON.stringify(req.body.answers[key])) edited.push(key);
                }

                if (edited.some((key) => !ColumnFields.includes(key))) input.answers = json(req.body.answers);
            }

            if (edited.length) {
                // Validate against the form the applicant filled out, not the current form
                const errors = validate(app.schema, {
                    name: app.name,
                    phone: app.phone,
                    email: app.email,
                    ...(req.body.answers !== undefined ? req.body.answers : app.answers),
                    ...Object.fromEntries(Object.entries(input).filter(([key]) => ColumnFields.includes(key)))
                });

                if (errors) {
                        return Err.respond(new Err(400, null, 'Validation Error'), res, errors);
                }

                events.push({ type: ApplicationEventType.EDITED, meta: { fields: edited } });
            }

            if (req.body.cohort !== undefined) {
                const cohort = req.body.cohort.trim() || 'unassigned';
                if (cohort !== app.cohort) {
                    input.cohort = cohort;
                    events.push({ type: ApplicationEventType.COHORT, meta: { from: app.cohort, to: cohort } });
                }
            }

            let assigned = app.assigned;
            if (req.body.assigned !== undefined && req.body.assigned !== app.assigned) {
                assigned = req.body.assigned;
                input.assigned = assigned;

                let to_name: string | null = null;
                if (assigned !== null) {
                    to_name = fullname(await config.models.User.from(assigned));

                    if (assigned !== user.id) {
                        notifications.push({ uid: assigned, text: `You are now the reviewer for the application of ${app.name}` });
                    }
                }

                events.push({
                    type: ApplicationEventType.ASSIGNED,
                    meta: {
                        from: app.assigned,
                        from_name: app.assigned_user ? fullname(app.assigned_user) : null,
                        to: assigned,
                        to_name
                    }
                });
            }

            if (req.body.user_id !== undefined && req.body.user_id !== app.user_id) {
                input.user_id = req.body.user_id;

                events.push({
                    type: ApplicationEventType.LINKED,
                    meta: {
                        from: app.user_id,
                        from_name: app.user ? fullname(app.user) : null,
                        to: req.body.user_id,
                        to_name: req.body.user_id !== null ? fullname(await config.models.User.from(req.body.user_id)) : null
                    }
                });
            }

            if (req.body.status !== undefined && req.body.status !== app.status) {
                input.status = req.body.status;

                events.push({
                    type: ApplicationEventType.STATUS,
                    body: (req.body.note || '').trim(),
                    meta: { from: app.status, to: req.body.status }
                });

                if (assigned !== null && assigned !== user.id) {
                    notifications.push({ uid: assigned, text: `The application of ${app.name} is now ${req.body.status}` });
                }
            }

            if (Object.keys(input).length) {
                await config.models.Application.commit(app.id, {
                    ...input,
                    updated: sql`Now()`
                });

                for (const event of events) {
                    await config.models.ApplicationEvent.record({
                        application: app.id,
                        author: user.id,
                        ...event
                    });
                }
            }

            res.json(await config.models.Application.augmented_from(app.id));

            for (const notification of notifications) {
                try {
                    await notify.generate('Application', notification.uid, { text: notification.text, url });
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/application/:applicationid', {
        name: 'Close Application',
        group: 'Applications',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Close an application without recording an outcome. Applications are never removed',
        res: StandardResponse
    }, async (req, res) => {
        try {
            const user = await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.ADMIN);

            const app = await config.models.Application.from(req.params.applicationid);

            if (app.status !== ApplicationStatus.CLOSED) {
                await config.models.Application.commit(app.id, {
                    updated: sql`Now()`,
                    status: ApplicationStatus.CLOSED
                });

                await config.models.ApplicationEvent.record({
                    application: app.id,
                    author: user.id,
                    type: ApplicationEventType.STATUS,
                    meta: { from: app.status, to: ApplicationStatus.CLOSED }
                });
            }

            res.json({
                status: 200,
                message: 'Application Closed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/application/:applicationid/event', {
        name: 'Get Events',
        group: 'Applications',
        params: Type.Object({
            applicationid: Type.Integer()
        }),
        description: 'Return the lifecycle events of an application, oldest first',
        query: Type.Object({
            limit: Type.Optional(Type.Integer({ default: 100 })),
            page: Type.Optional(Type.Integer()),
            order: Type.Optional(Type.Enum(GenericListOrder))
        }),
        res: Type.Object({
            total: Type.Integer(),
            items: Type.Array(ApplicationEventResponse)
        })
    }, async (req, res) => {
        try {
            await Auth.is_iam(config, req, IamGroup.Application, PermissionsLevel.VIEW);

            res.json(await config.models.ApplicationEvent.augmented_list({
                limit: req.query.limit || 100,
                page: req.query.page,
                order: req.query.order,
                sort: 'created',
                where: sql`application = ${req.params.applicationid}`
            }));
        } catch (err) {
            Err.respond(err, res);
        }
    });
}
