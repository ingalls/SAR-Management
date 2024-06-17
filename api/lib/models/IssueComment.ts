import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { IssueComment, User } from '../schema.js';
import { sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedIssueComment = Type.Object({
    id: Type.Integer(),
    issue: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    body: Type.String(),
    author: Type.Integer(),
    archived: Type.Boolean(),
    user: Type.Object({
        id: Type.Integer(),
        fname: Type.String(),
        lname: Type.String()
    })
});

export default class IssueCommentModel extends Modeler<typeof IssueComment> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, IssueComment);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedIssueComment>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());


        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: IssueComment.id,
                issue: IssueComment.issue,
                created: IssueComment.created,
                updated: IssueComment.updated,
                body: IssueComment.body,
                author: IssueComment.author,
                archived: IssueComment.archived,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user')
            })
            .from(IssueComment)
            .leftJoin(User, eq(User.id, IssueComment.author))
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
                    return t as Static<typeof AugmentedIssueComment>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedIssueComment>> {
        const pgres = await this.pool
            .select({
                id: IssueComment.id,
                issue: IssueComment.issue,
                created: IssueComment.created,
                updated: IssueComment.updated,
                body: IssueComment.body,
                author: IssueComment.author,
                archived: IssueComment.archived,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user')
            })
            .from(IssueComment)
            .leftJoin(User, eq(User.id, IssueComment.author))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedIssueComment>;
    }
}
