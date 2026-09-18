import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ApplicationEvent, User } from '../schema.js';
import { ApplicationEventType } from '../application-status.js';
import { sql, eq, asc, desc } from 'drizzle-orm';

export const AugmentedApplicationEvent = Type.Object({
    id: Type.Integer(),
    application: Type.Integer(),
    created: Type.String(),
    author: Type.Union([Type.Null(), Type.Integer()]),
    type: Type.Enum(ApplicationEventType),
    body: Type.String(),
    meta: Type.Record(Type.String(), Type.Unknown()),
    user: Type.Union([Type.Null(), Type.Object({
        id: Type.Integer(),
        fname: Type.String(),
        lname: Type.String()
    })], { description: 'NULL when the event was caused by the applicant or the system' })
});

export default class ApplicationEventModel extends Modeler<typeof ApplicationEvent> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, ApplicationEvent);
    }

    /**
     * Record an event in the application timeline
     * meta is written as ::TEXT::JSON as the driver would otherwise double encode it
     */
    async record(event: {
        application: number;
        author?: number | null;
        type: ApplicationEventType;
        body?: string;
        meta?: Record<string, unknown>;
    }): Promise<void> {
        await this.generate({
            application: event.application,
            author: event.author ?? null,
            type: event.type,
            body: event.body || '',
            meta: sql`${JSON.stringify(event.meta || {})}::TEXT::JSON`
        });
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedApplicationEvent>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ApplicationEvent.id,
                application: ApplicationEvent.application,
                created: ApplicationEvent.created,
                author: ApplicationEvent.author,
                type: ApplicationEvent.type,
                body: ApplicationEvent.body,
                meta: ApplicationEvent.meta,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                } | null>`CASE WHEN users.id IS NULL THEN NULL ELSE json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname) END`.as('user')
            })
            .from(ApplicationEvent)
            .leftJoin(User, eq(User.id, ApplicationEvent.author))
            .where(query.where)
            .orderBy(orderBy)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => {
                    const row = t as Record<string, unknown>;
                    delete row.count;
                    return row as Static<typeof AugmentedApplicationEvent>
                })
            };
        }
    }
}
