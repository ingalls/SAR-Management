import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, IssueAssigned } from '../schema.js';
import { sql, eq, asc, desc } from 'drizzle-orm';

export const AugmentedIssueAssigned = Type.Object({
    id: Type.Integer(),
    issue_id: Type.Integer(),
    uid: Type.Integer(),
    fname: Type.String(),
    lname: Type.String(),
    username: Type.String()
})

export default class IssueAssignedModel extends Modeler<typeof IssueAssigned> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, IssueAssigned);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedIssueAssigned>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: IssueAssigned.id,
                issue_id: IssueAssigned.issue_id,
                uid: IssueAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(IssueAssigned)
            .leftJoin(User, eq(IssueAssigned.uid, User.id))
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
                    return t as Static<typeof AugmentedIssueAssigned>
                })
            };
        }
    }
}
