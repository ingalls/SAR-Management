import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Application } from '../schema.js';
import { ApplicationStatus } from '../application-status.js';
import { sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

// Response validation coerces types, NULL has to be the first member of a union or it becomes 0
const ApplicationUser = Type.Object({
    id: Type.Integer(),
    fname: Type.String(),
    lname: Type.String()
});

export const AugmentedApplication = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    status: Type.Enum(ApplicationStatus),
    cohort: Type.String(),
    name: Type.String(),
    phone: Type.String(),
    email: Type.String(),
    answers: Type.Record(Type.String(), Type.Unknown(), { description: 'Form answers that are not first class fields' }),
    schema: Type.Unknown({ description: 'Snapshot of the application form when the application was submitted' }),
    assigned: Type.Union([Type.Null(), Type.Integer()]),
    user_id: Type.Union([Type.Null(), Type.Integer()]),
    agency_id: Type.Union([Type.Null(), Type.Integer()]),
    comments: Type.Integer({ description: 'Number of reviewer comments' }),
    assigned_user: Type.Union([Type.Null(), ApplicationUser]),
    user: Type.Union([Type.Null(), ApplicationUser], { description: 'Member account created from this application' })
});

export const ApplicationCounts = Type.Record(Type.Enum(ApplicationStatus), Type.Integer());

/**
 * json() columns can contain a JSON encoded string instead of an object
 * depending on how they were written - always hand back the object
 */
function unwrap<T>(value: unknown, fallback: T): T {
    let current = value;
    for (let i = 0; i < 2 && typeof current === 'string'; i++) {
        try {
            current = JSON.parse(current);
        } catch {
            return fallback;
        }
    }

    if (current === null || typeof current !== 'object') return fallback;
    return current as T;
}

export default class ApplicationModel extends Modeler<typeof Application> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Application);
    }

    #select() {
        return {
            id: Application.id,
            created: Application.created,
            updated: Application.updated,
            status: Application.status,
            cohort: Application.cohort,
            name: Application.name,
            phone: Application.phone,
            email: Application.email,
            answers: Application.answers,
            schema: Application.schema,
            assigned: Application.assigned,
            user_id: Application.user_id,
            agency_id: Application.agency_id,
            comments: sql<number>`(
                SELECT count(*)::INT
                FROM application_comments
                WHERE application_comments.application = applications.id AND NOT application_comments.archived
            )`.as('comments'),
            assigned_user: sql<Static<typeof ApplicationUser> | null>`(
                SELECT json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)
                FROM users
                WHERE users.id = applications.assigned
            )`.as('assigned_user'),
            user: sql<Static<typeof ApplicationUser> | null>`(
                SELECT json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)
                FROM users
                WHERE users.id = applications.user_id
            )`.as('user'),
        };
    }

    #format(row: Record<string, unknown>): Static<typeof AugmentedApplication> {
        delete row.count;
        row.answers = unwrap<Record<string, unknown>>(row.answers, {});
        row.schema = unwrap<Record<string, unknown>>(row.schema, {});
        return row as Static<typeof AugmentedApplication>;
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedApplication>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                ...this.#select()
            })
            .from(Application)
            .where(query.where)
            .orderBy(orderBy, desc(Application.id))
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            const total = parseInt(pgres[0].count);

            return {
                total,
                items: pgres.map((t) => this.#format(t))
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedApplication>> {
        const pgres = await this.pool
            .select(this.#select())
            .from(Application)
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Application Not Found`);

        return this.#format(pgres[0]);
    }

    /**
     * Number of applications in each status - every status is always present
     */
    async counts(where?: SQL<unknown>): Promise<Static<typeof ApplicationCounts>> {
        const pgres = await this.pool
            .select({
                status: Application.status,
                count: sql<number>`count(*)::INT`.as('count')
            })
            .from(Application)
            .where(where)
            .groupBy(Application.status);

        const counts = {} as Record<string, number>;
        for (const status of Object.values(ApplicationStatus)) counts[status] = 0;
        for (const row of pgres) {
            if (counts[row.status] !== undefined) counts[row.status] = row.count;
        }

        return counts as Static<typeof ApplicationCounts>;
    }
}
