import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import { Iam } from '../auth.js';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Team, UserTeam, User } from '../schema.js';
import { sql, eq, asc, desc, max } from 'drizzle-orm';

export const AugmentedTeam = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    public: Type.Boolean(),
    name: Type.String(),
    body: Type.String(),
    iam: Iam,
    colour_bg: Type.String(),
    colour_txt: Type.String(),
    fieldable: Type.Boolean(),
    members: Type.Optional(Type.Integer())
});

export default class TeamModel extends Modeler<typeof Team> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Team);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedTeam>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootMember = this.pool
            .select({
                members_team_id: max(UserTeam.tid).as('members_team_id'),
                members: sql<string>`count(users.id)`.as('members')
            })
            .from(UserTeam, eq(Team.id, UserTeam.tid))
            .leftJoin(User, eq(User.id, UserTeam.uid))
            .groupBy(UserTeam.tid)
            .as("root_members");

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: Team.id,
                created: Team.created,
                updated: Team.updated,
                public: Team.public,
                name: Team.name,
                body: Team.body,
                iam: Team.iam,
                colour_bg: Team.colour_bg,
                colour_txt: Team.colour_txt,
                fieldable: Team.fieldable,
                members: RootMember.members
            })
            .from(Team)
            .leftJoin(RootMember, eq(Team.id, RootMember.members_team_id))
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
                    return t as Static<typeof AugmentedTeam>
                })
            };
        }
    }
}
