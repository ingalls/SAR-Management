import Modeler, { Param, GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ApplicationComment, User } from '../schema.js';
import { InferSelectModel, sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export type AugmentedApplicationComment = {
    id: number;
    application: number;
    created: Date;
    updated: Date;
    body: string;
    author: number;
    archived: boolean;
    user: {
        id: number;
        fname: string;
        lname: string;
    }
}

export default class ApplicationCommentModel extends Modeler<typeof ApplicationComment> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, ApplicationComment);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<AugmentedApplicationComment>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());


        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ApplicationComment.id,
                application: ApplicationComment.application,
                created: ApplicationComment.created,
                updated: ApplicationComment.updated,
                body: ApplicationComment.body,
                author: ApplicationComment.author,
                archived: ApplicationComment.archived,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user')
            })
            .from(ApplicationComment)
            .leftJoin(User, eq(User.id, ApplicationComment.author))
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
                    delete t.count;
                    return t as AugmentedApplicationComment
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<AugmentedApplicationComment> {
        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: ApplicationComment.id,
                application: ApplicationComment.application,
                created: ApplicationComment.created,
                updated: ApplicationComment.updated,
                body: ApplicationComment.body,
                author: ApplicationComment.author,
                archived: ApplicationComment.archived,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user')
            })
            .from(ApplicationComment)
            .leftJoin(User, eq(User.id, ApplicationComment.author))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as AugmentedApplicationComment;
    }
}
