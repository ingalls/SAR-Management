import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Issue, IssueAssigned, IssueComment, IssueTag, IssueTagAssigned, User } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

export const Assigned = Type.Object({
    id: Type.Integer(),
    fname: Type.String(),
    lname: Type.String()
});

export const PartialTag = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    icon: Type.String(),
    colour_bg: Type.String(),
    colour_txt: Type.String(),
    created: Type.String(),
    updated: Type.String()
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
    assigned: Type.Array(Assigned),
    assigned_ids: Type.Array(Type.Integer()),
    tags: Type.Array(PartialTag),
    tags_id: Type.Array(Type.Integer()),
    comments: Type.Integer({ description: 'Number of comments on the issue' })
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

        const RootTags = this.pool
            .select({
                tags_issue_id: max(IssueTagAssigned.issue_id).as('tags_issue_id'),
                tags_id: sql<Array<number>>`coalesce(array_agg(issue_tag.id), '{}'::INT[])`.as('tags_id'),
                tags: sql<Array<Static<typeof PartialTag>>>`coalesce(json_agg(json_build_object(
                    'id', issue_tag.id,
                    'name', issue_tag.name,
                    'icon', issue_tag.icon,
                    'colour_bg', issue_tag.colour_bg,
                    'colour_txt', issue_tag.colour_txt,
                    'created', issue_tag.created,
                    'updated', issue_tag.updated
                )), '[]'::JSON)`.as('tags'),
            })
            .from(IssueTag)
            .leftJoin(IssueTagAssigned, eq(IssueTag.id, IssueTagAssigned.tag_id))
            .groupBy(IssueTagAssigned.issue_id)
            .as("root_tags");

        const RootComments = this.pool
            .select({
                comments_issue_id: IssueComment.issue,
                comments: sql<number>`count(*)::INT`.as('comments'),
            })
            .from(IssueComment)
            .groupBy(IssueComment.issue)
            .as("root_comments");

        const Root = this.pool
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
                assigned: RootAssigned.assigned,
                assigned_ids: RootAssigned.assigned_ids,
                tags: RootTags.tags,
                tags_id: RootTags.tags_id,
                comments: sql<number>`coalesce(root_comments.comments, 0)`.as('comments')
            })
            .from(Issue)
            .leftJoin(User, eq(User.id, Issue.author))
            .leftJoin(RootTags, eq(RootTags.tags_issue_id, Issue.id))
            .leftJoin(RootComments, eq(RootComments.comments_issue_id, Issue.id))
            .leftJoin(RootAssigned, eq(RootAssigned.assigned_issue_id, Issue.id))
            .orderBy(orderBy)
            .as('root');

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: Root.id,
                created: Root.created,
                updated: Root.updated,
                status: Root.status,
                start_ts: Root.start_ts,
                end_ts: Root.end_ts,
                title: Root.title,
                body: Root.body,
                author: Root.author,
                poll_id: Root.poll_id,
                user: Root.user,
                assigned: Root.assigned,
                assigned_ids: Root.assigned_ids,
                tags: Root.tags,
                tags_id: Root.tags_id,
                comments: Root.comments
            })
            .from(Root)
            .where(query.where)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => {
                    if (!t.assigned) t.assigned = [];
                    if (!t.assigned_ids) t.assigned_ids = [];
                    if (!t.tags) t.tags = [];
                    if (!t.tags_id) t.tags_id = [];
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

        const RootTags = this.pool
            .select({
                tags_issue_id: max(IssueTagAssigned.issue_id).as('tags_issue_id'),
                tags_id: sql<Array<number>>`coalesce(array_agg(issue_tag.id), '{}'::INT[])`.as('tags_id'),
                tags: sql<Array<Static<typeof PartialTag>>>`coalesce(json_agg(json_build_object(
                    'id', issue_tag.id,
                    'name', issue_tag.name,
                    'icon', issue_tag.icon,
                    'colour_bg', issue_tag.colour_bg,
                    'colour_txt', issue_tag.colour_txt,
                    'created', issue_tag.created,
                    'updated', issue_tag.updated
                )), '[]'::JSON)`.as('tags'),
            })
            .from(IssueTag)
            .leftJoin(IssueTagAssigned, eq(IssueTag.id, IssueTagAssigned.tag_id))
            .groupBy(IssueTagAssigned.issue_id)
            .as("root_tags");

        const RootComments = this.pool
            .select({
                comments_issue_id: IssueComment.issue,
                comments: sql<number>`count(*)::INT`.as('comments'),
            })
            .from(IssueComment)
            .groupBy(IssueComment.issue)
            .as("root_comments");

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
                assigned: RootAssigned.assigned,
                assigned_ids: RootAssigned.assigned_ids,
                tags: RootTags.tags,
                tags_id: RootTags.tags_id,
                comments: sql<number>`coalesce(root_comments.comments, 0)`.as('comments')
            })
            .from(Issue)
            .leftJoin(User, eq(User.id, Issue.author))
            .leftJoin(RootTags, eq(RootTags.tags_issue_id, Issue.id))
            .leftJoin(RootComments, eq(RootComments.comments_issue_id, Issue.id))
            .leftJoin(RootAssigned, eq(Issue.id, RootAssigned.assigned_issue_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        if (!pgres[0].assigned) pgres[0].assigned = [];
        if (!pgres[0].assigned_ids) pgres[0].assigned_ids = [];
        if (!pgres[0].tags) pgres[0].tags = [];
        if (!pgres[0].tags_id) pgres[0].tags_id = [];

        return pgres[0] as Static<typeof AugmentedIssue>;
    }
}
