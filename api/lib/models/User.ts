import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, UserTeam, Team, UserExternal } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL, InferSelectModel, and, notExists, ilike } from 'drizzle-orm';

export const User_EmergencyContact = Type.Object({
    name: Type.String(),
    phone: Type.String(),
    relationship: Type.String()
});

export const PartialTeam = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    created: Type.String(),
    updated: Type.String(),
    public: Type.Boolean(),
    colour_bg: Type.String(),
    colour_txt: Type.String(),
    fieldable: Type.Boolean()
});

export const AugmentedUser = Type.Object({
    id: Type.Integer(),
    access: Type.String(),
    teams: Type.Array(PartialTeam),
    disabled: Type.Boolean(),
    username: Type.String(),
    created: Type.String(),
    updated: Type.String(),
    bday: Type.Optional(Type.String()),
    phone: Type.String(),
    email: Type.String(),
    lname: Type.String(),
    fname: Type.String(),
    start_year: Type.Integer(),
    last_login: Type.String(),
    emergency: Type.Array(User_EmergencyContact),
    address_street: Type.String(),
    address_city: Type.String(),
    address_state: Type.String(),
    address_zip: Type.String(),
    mfa_enabled: Type.Boolean()
})

export default class UserModel extends Modeler<typeof User> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, User);
    }

    async from(id: string | number | SQL<unknown>) {
        return await super.from(id);
    }

    async addExternal(uid: number, integration: string, value: string) {
        await this.pool.insert(UserExternal).values({
            uid,
            integration,
            value
        });
    }

    async listMissingExternal(integration: string) {
        return await this.pool.select().from(User).where(notExists(
            this.pool.select().from(UserExternal).where(and(
                eq(UserExternal.uid, User.id),
                eq(UserExternal.integration, integration)
            ))
        ));

    }

    async listExternal(integration: string, query: GenericListInput = {}) {
        const order = query.order && query.order === 'desc' ? desc : asc;

        let orderBy;
        if (query.sort && (User as any)[query.sort]) {
             orderBy = order((User as any)[query.sort]);
        } else {
             orderBy = order(User.id);
        }

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                user: User,
                external: UserExternal.value
            })
            .from(User)
            .leftJoin(UserExternal, and(
                eq(UserExternal.uid, User.id),
                eq(UserExternal.integration, integration)
            ))
            .where(query.where)
            .orderBy(orderBy)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10));

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        }

        return {
            total: parseInt(pgres[0].count),
            items: pgres.map((res) => {
                return {
                    ...res.user,
                    external: res.external
                }
            })
        };
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedUser>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootTeam = this.pool
            .select({
                teams_uid: max(UserTeam.uid).as('teams_uid'),
                teams_id: sql<Array<number>>`coalesce(array_agg(teams.id), '{}'::INT[])`.as('teams_id'),
                teams: sql<Array<Static<typeof PartialTeam>>>`coalesce(json_agg(json_build_object(
                    'id', teams.id,
                    'name', teams.name,
                    'created', teams.created,
                    'updated', teams.updated,
                    'public', teams.public,
                    'colour_bg', teams.colour_bg,
                    'colour_txt', teams.colour_txt,
                    'fieldable', teams.fieldable
                )), '[]'::JSON)`.as('teams'),
            })
            .from(UserTeam)
            .leftJoin(Team, eq(UserTeam.tid, Team.id))
            .groupBy(UserTeam.uid)
            .as("root_teams");

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                teams: RootTeam.teams,
                teams_id: RootTeam.teams_id,
                generic: this.generic
            })
            .from(User)
            .leftJoin(RootTeam, eq(this.generic.id, RootTeam.teams_uid))
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
                    const generic = t.generic as InferSelectModel<typeof User> & { teams: Array<Static<typeof PartialTeam>> };
                    if (!generic.teams) generic.teams = [];
                    if (generic.bday === null) delete (generic as any).bday;
                    return generic as unknown as Static<typeof AugmentedUser>;
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedUser>> {
        const RootTeam = this.pool
            .select({
                teams_uid: max(UserTeam.uid).as('teams_uid'),
                teams_id: sql<Array<number>>`coalesce(array_agg(teams.id), '{}'::INT[])`.as('teams_id'),
                teams: sql<Array<Static<typeof PartialTeam>>>`coalesce(json_agg(json_build_object(
                    'id', teams.id,
                    'name', teams.name,
                    'created', teams.created,
                    'updated', teams.updated,
                    'public', teams.public,
                    'colour_bg', teams.colour_bg,
                    'colour_txt', teams.colour_txt,
                    'fieldable', teams.fieldable
                )), '[]'::JSON)`.as('teams'),
            })
            .from(UserTeam)
            .leftJoin(Team, eq(UserTeam.tid, Team.id))
            .groupBy(UserTeam.uid)
            .as("root_teams");

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                teams: RootTeam.teams,
                generic: this.generic
            })
            .from(User)
            .leftJoin(RootTeam, eq(this.generic.id, RootTeam.teams_uid))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        const generic = pgres[0].generic as InferSelectModel<typeof User>;

        if (generic.bday === null) delete (generic as any).bday;

        return {
            teams: pgres[0].teams || [],
            ...generic
        } as unknown as Static<typeof AugmentedUser>;
    }
}
