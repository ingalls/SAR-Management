import Modeler, { Param, GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Mission, MissionTeam, MissionAssigned, Team, User } from '../schema.js';
import { InferSelectModel, sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const PartialTeam = Type.Object({
    id: Type.Integer(),
    created: Type.Integer(),
    updated: Type.Integer(),
    public: Type.Boolean(),
    colour_bg: Type.String(),
    colour_txt: Type.String(),
    fieldable: Type.Boolean()
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
    teams_id: Type.Array(Type.Integer())
});

export default class MissionModel extends Modeler<typeof Mission> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, Mission);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedMission>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());


        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
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
                users: sql<Array<number>>`json_agg(users.id)`,
                teams: sql<Array<Static<typeof PartialTeam>>>`json_agg(json_build_object(
                    'id', users.id,
                    'created', users.fname,
                    'updated', users.lname,
                    'public', users.lname,
                    'colour_bg', users.colour_bg,
                    'colour_txt', users.colour_txt,
                    'fieldable', users.fieldable,
                ))`.as('teams'),
                teams_id: sql<Array<number>>`json_agg(teams.id)`,
            })
            .from(Mission)
            .leftJoin(MissionTeam, eq(Mission.id, MissionTeam.mission_id))
            .leftJoin(Team, eq(Team.id, MissionTeam.team_id))
            .leftJoin(MissionAssigned, eq(MissionAssigned.mission_id, Mission.id))
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
                    return t as Static<typeof AugmentedMission>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedMission>> {
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
                users: sql<Array<number>>`json_agg(users.id)`,
                teams: sql<Array<Static<typeof PartialTeam>>>`json_agg(json_build_object(
                    'id', users.id,
                    'created', users.fname,
                    'updated', users.lname,
                    'public', users.lname,
                    'colour_bg', users.colour_bg,
                    'colour_txt', users.colour_txt,
                    'fieldable', users.fieldable,
                ))`.as('teams'),
                teams_id: sql<Array<number>>`json_agg(teams.id)`,
            })
            .from(Mission)
            .leftJoin(MissionTeam, eq(Mission.id, MissionTeam.mission_id))
            .leftJoin(Team, eq(Team.id, MissionTeam.team_id))
            .leftJoin(MissionAssigned, eq(MissionAssigned.mission_id, Mission.id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedMission>;
    }
}
