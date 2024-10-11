import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Mission, MissionTeam, MissionAssigned, MissionTag, MissionTagAssigned, Team } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

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

export const PartialTag = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    created: Type.String(),
    updated: Type.String()
});

export const AugmentedMission = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    status: Type.String(),
    title: Type.String(),
    body: Type.String(),
    author: Type.Integer(),
    location: Type.String(),
    location_geom: Type.Optional(Type.Any()),
    externalid: Type.Optional(Type.String()),
    users: Type.Array(Type.Integer()),
    teams: Type.Array(PartialTeam),
    teams_id: Type.Array(Type.Integer()),
    tags: Type.Array(PartialTag),
    tags_id: Type.Array(Type.Integer())
});

export default class MissionModel extends Modeler<typeof Mission> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Mission);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedMission>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootTeams = this.pool
            .select({
                teams_mission_id: max(MissionTeam.mission_id).as('teams_mission_id'),
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
            .from(MissionTeam)
            .leftJoin(Team, eq(Team.id, MissionTeam.team_id))
            .groupBy(MissionTeam.mission_id)
            .as("root_teams");

        const RootTags = this.pool
            .select({
                tags_mission_id: max(MissionTagAssigned.mission_id).as('tags_mission_id'),
                tags_id: sql<Array<number>>`coalesce(array_agg(mission_tag.id), '{}'::INT[])`.as('tags_id'),
                tags: sql<Array<Static<typeof PartialTag>>>`coalesce(json_agg(json_build_object(
                    'id', mission_tag.id,
                    'name', mission_tag.name,
                    'created', mission_tag.created,
                    'updated', mission_tag.updated
                )), '[]'::JSON)`.as('tags'),
            })
            .from(MissionTag)
            .leftJoin(MissionTagAssigned, eq(MissionTag.id, MissionTagAssigned.tag_id))
            .groupBy(MissionTagAssigned.mission_id)
            .as("root_tags");

        const RootUsers = this.pool
            .select({
                users_mission_id: max(MissionAssigned.mission_id).as('users_mission_id'),
                users: sql<Array<number>>`coalesce(array_agg(missions_assigned.uid), '{}'::INT[])`.as('users'),
            })
            .from(MissionAssigned)
            .groupBy(MissionAssigned.mission_id)
            .as("root_users");

        const Root = this.pool
            .select({
                id: Mission.id,
                created: Mission.created,
                updated: Mission.updated,
                start_ts: Mission.start_ts,
                end_ts: Mission.end_ts,
                status: Mission.status,
                title: Mission.title,
                body: Mission.body,
                author: Mission.author,
                location: Mission.location,
                location_geom: Mission.location_geom,
                externalid: Mission.externalid,
                teams: RootTeams.teams,
                teams_id: RootTeams.teams_id,
                tags: RootTags.tags,
                tags_id: RootTags.tags_id,
                users: RootUsers.users
            })
            .from(Mission)
            .leftJoin(RootTeams, eq(Mission.id, RootTeams.teams_mission_id))
            .leftJoin(RootUsers, eq(Mission.id, RootUsers.users_mission_id))
            .leftJoin(RootTags, eq(Mission.id, RootTags.tags_mission_id))
            .orderBy(orderBy)
            .as('root')

        const pgres = await this.pool.select({
            count: sql<string>`count(*) OVER()`.as('count'),
            id: Root.id,
            created: Root.created,
            updated: Root.updated,
            start_ts: Root.start_ts,
            end_ts: Root.end_ts,
            status: Root.status,
            title: Root.title,
            body: Root.body,
            author: Root.author,
            location: Root.location,
            location_geom: Root.location_geom,
            externalid: Root.externalid,
            teams: Root.teams,
            teams_id: Root.teams_id,
            tags: Root.tags,
            tags_id: Root.tags_id,
            users: Root.users
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
                    delete t.count;
                    if (!t.teams_id) t.teams_id = [];
                    if (!t.teams) t.teams = [];

                    if (!t.tags_id) t.tags_id = [];
                    if (!t.tags) t.tags = [];

                    if (!t.users) t.users = [];

                    return t as Static<typeof AugmentedMission>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedMission>> {
        const RootTeams = this.pool
            .select({
                teams_mission_id: max(MissionTeam.mission_id).as('teams_mission_id'),
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
            .from(MissionTeam)
            .leftJoin(Team, eq(Team.id, MissionTeam.team_id))
            .groupBy(MissionTeam.mission_id)
            .as("root_teams");

        const RootTags = this.pool
            .select({
                tags_mission_id: max(MissionTagAssigned.mission_id).as('tags_mission_id'),
                tags_id: sql<Array<number>>`coalesce(array_agg(mission_tag.id), '{}'::INT[])`.as('tags_id'),
                tags: sql<Array<Static<typeof PartialTag>>>`coalesce(json_agg(json_build_object(
                    'id', mission_tag.id,
                    'name', mission_tag.name,
                    'created', mission_tag.created,
                    'updated', mission_tag.updated
                )), '[]'::JSON)`.as('tags'),
            })
            .from(MissionTag)
            .leftJoin(MissionTagAssigned, eq(MissionTag.id, MissionTagAssigned.tag_id))
            .groupBy(MissionTagAssigned.mission_id)
            .as("root_tags");

        const RootUsers = this.pool
            .select({
                users_mission_id: max(MissionAssigned.mission_id).as('users_mission_id'),
                users: sql<Array<number>>`coalesce(array_agg(missions_assigned.uid), '{}'::INT[])`.as('users'),
            })
            .from(MissionAssigned)
            .groupBy(MissionAssigned.mission_id)
            .as("root_users");

        const pgres = await this.pool
            .select({
                id: Mission.id,
                created: Mission.created,
                updated: Mission.updated,
                start_ts: Mission.start_ts,
                end_ts: Mission.end_ts,
                status: Mission.status,
                title: Mission.title,
                body: Mission.body,
                author: Mission.author,
                location: Mission.location,
                location_geom: Mission.location_geom,
                externalid: Mission.externalid,
                teams: RootTeams.teams,
                teams_id: RootTeams.teams_id,
                tags: RootTags.tags,
                tags_id: RootTags.tags_id,
                users: RootUsers.users
            })
            .from(Mission)
            .leftJoin(RootTeams, eq(Mission.id, RootTeams.teams_mission_id))
            .leftJoin(RootUsers, eq(Mission.id, RootUsers.users_mission_id))
            .leftJoin(RootTags, eq(Mission.id, RootTags.tags_mission_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        if (!pgres[0].teams_id) pgres[0].teams_id = [];
        if (!pgres[0].teams) pgres[0].teams = [];
        if (!pgres[0].tags_id) pgres[0].tags_id = [];
        if (!pgres[0].tags) pgres[0].tags = [];
        if (!pgres[0].users) pgres[0].users = [];

        return pgres[0] as Static<typeof AugmentedMission>;
    }
}
