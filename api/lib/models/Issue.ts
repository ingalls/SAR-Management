import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Issue, IssueAssigned, User } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

export const Assigned = Type.Object({
    id: Type.Integer(),
    fname: Type.String(),
    lname: Type.String()
});

export const AugmentedIssue = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    status: Type.String(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    title: Type.String(),
    body: Type.String(),
    author: Type.Integer(),
    poll_id: Type.Integer(),
    user: Type.Object({
        id: Type.Integer(),
        fname: Type.String(),
        lname: Type.String()
    }),
    assigned: Type.Array(Assigned)
});

export default class IssueModel extends Modeler<typeof Issue> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Issue);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedIssue>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootAssigned = this.pool
            .select({
                assigned_issue_id: max(IssueAssigned.issue_id).as('assigned_issue_id'),
                assigned_ids: sql<Array<number>>`coalesce(array_agg(issues_assigned.uid), '{}'::INT[])`.as('assigned_ids'),
                assigned: sql<Array<Static<typeof Assigned>>>`json_agg(json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname))`.as('assigned')
            })
            .from(IssueAssigned)
            .leftJoin(User, eq(IssueAssigned.uid, User.id))
            .groupBy(IssueAssigned.issue_id)
            .as("root_assigned");

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: Issue.id,
                created: Issue.created,
                updated: Issue.updated,
                status: Issue.status,
                start_ts: Issue.start_ts,
                end_ts: Issue.end_ts,
                title: Issue.title,
                body: Issue.body,
                author: Issue.author,
                poll_id: Issue.poll_id,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user'),
                assigned: RootAssigned.assigned
            })
            .from(Issue)
            .leftJoin(User, eq(User.id, Issue.author))
            .leftJoin(RootAssigned, eq(RootAssigned.assigned_issue_id, Issue.id))
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
                    if (!t.assigned) t.assigned = [];
                    return t as Static<typeof AugmentedIssue>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedIssue>> {
        const RootAssigned = this.pool
            .select({
                assigned_issue_id: max(IssueAssigned.issue_id).as('assigned_issue_id'),
                assigned_ids: sql<Array<number>>`coalesce(array_agg(issues_assigned.uid), '{}'::INT[])`.as('assigned_ids'),
                assigned: sql<Array<Static<typeof Assigned>>>`json_agg(json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname))`.as('assigned')
            })
            .from(IssueAssigned)
            .leftJoin(User, eq(IssueAssigned.uid, User.id))
            .groupBy(IssueAssigned.issue_id)
            .as("root_assigned");

        const pgres = await this.pool
            .select({
                id: Issue.id,
                created: Issue.created,
                updated: Issue.updated,
                status: Issue.status,
                start_ts: Issue.start_ts,
                end_ts: Issue.end_ts,
                title: Issue.title,
                body: Issue.body,
                author: Issue.author,
                poll_id: Issue.poll_id,
                user: sql<{
                    id: number;
                    fname: string;
                    lname: string;
                }>`json_build_object('id', users.id, 'fname', users.fname, 'lname', users.lname)`.as('user'),
                assigned: RootAssigned.assigned
            })
            .from(Issue)
            .leftJoin(User, eq(User.id, Issue.author))
            .leftJoin(RootAssigned, eq(Issue.id, RootAssigned.assigned_issue_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        if (!pgres[0].assigned) pgres[0].assigned = [];

        return pgres[0] as Static<typeof AugmentedIssue>;
    }
}
