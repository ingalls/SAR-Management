import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Training, TrainingTeam, TrainingAssigned, Team, Asset, TrainingAsset } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL } from 'drizzle-orm';

export const PartialAsset = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    created: Type.String(),
    updated: Type.String(),
    storage: Type.Boolean()
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

export const AugmentedTraining = Type.Object({
    id: Type.Integer(),
    created: Type.String(),
    updated: Type.String(),
    start_ts: Type.String(),
    end_ts: Type.String(),
    title: Type.String(),
    body: Type.String(),
    author: Type.Integer(),
    location: Type.String(),
    location_geom: Type.Optional(Type.Any()),
    required: Type.Boolean(),
    teams: Type.Array(PartialTeam),
    teams_id: Type.Array(Type.Integer()),
    assets: Type.Array(PartialAsset),
    assets_id: Type.Array(Type.Integer()),
    users: Type.Array(Type.Integer())
});

export default class TrainingModel extends Modeler<typeof Training> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Training);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedTraining>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const RootTeams = this.pool
            .select({
                teams_training_id: max(TrainingTeam.training_id).as('teams_training_id'),
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
            .from(TrainingTeam)
            .leftJoin(Team, eq(Team.id, TrainingTeam.team_id))
            .groupBy(TrainingTeam.training_id)
            .as("root_teams");

        const RootAssets = this.pool
            .select({
                assets_training_id: max(TrainingAsset.training_id).as('assets_training_id'),
                assets_id: sql<Array<number>>`coalesce(array_agg(assets.id), '{}'::INT[])`.as('assets_id'),
                assets: sql<Array<Static<typeof PartialAsset>>>`coalesce(json_agg(json_build_object(
                    'id', assets.id,
                    'name', assets.name,
                    'created', assets.created,
                    'updated', assets.updated,
                    'storage', assets.storage
                )), '[]'::JSON)`.as('assets'),
            })
            .from(Asset)
            .leftJoin(TrainingAsset, eq(Asset.id, TrainingAsset.asset_id))
            .groupBy(TrainingAsset.training_id)
            .as("root_assets");

        const RootUsers = this.pool
            .select({
                users_training_id: max(TrainingAssigned.training_id).as('users_training_id'),
                users: sql<Array<number>>`coalesce(array_agg(training_assigned.uid), '{}'::INT[])`.as('users'),
            })
            .from(TrainingAssigned)
            .groupBy(TrainingAssigned.training_id)
            .as("root_users");

        const Root = this.pool
            .select({
                id: Training.id,
                created: Training.created,
                updated: Training.updated,
                start_ts: Training.start_ts,
                end_ts: Training.end_ts,
                title: Training.title,
                body: Training.body,
                author: Training.author,
                location: Training.location,
                location_geom: Training.location_geom,
                required: Training.required,
                teams: RootTeams.teams,
                teams_id: RootTeams.teams_id,
                users: RootUsers.users,
                assets: RootAssets.assets,
                assets_id: RootAssets.assets_id
            })
            .from(Training)
            .leftJoin(RootTeams, eq(Training.id, RootTeams.teams_training_id))
            .leftJoin(RootUsers, eq(Training.id, RootUsers.users_training_id))
            .leftJoin(RootAssets, eq(Training.id, RootAssets.assets_training_id))
            .orderBy(orderBy)
            .as('root')

        const pgres = await this.pool.select({
            count: sql<string>`count(*) OVER()`.as('count'),
            id: Root.id,
            created: Root.created,
            updated: Root.updated,
            start_ts: Root.start_ts,
            end_ts: Root.end_ts,
            title: Root.title,
            body: Root.body,
            author: Root.author,
            location: Root.location,
            location_geom: Root.location_geom,
            required: Root.required,
            teams: Root.teams,
            teams_id: Root.teams_id,
            users: Root.users,
            assets: Root.assets,
            assets_id: Root.assets_id
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
                    if (!t.teams_id) t.teams_id = [];
                    if (!t.teams) t.teams = [];
                    if (!t.users) t.users = [];
                    if (!t.assets_id) t.assets_id = [];
                    if (!t.assets) t.assets = [];

                    return t as Static<typeof AugmentedTraining>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedTraining>> {
        const RootTeams = this.pool
            .select({
                teams_training_id: max(TrainingTeam.training_id).as('teams_training_id'),
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
            .from(TrainingTeam)
            .leftJoin(Team, eq(Team.id, TrainingTeam.team_id))
            .groupBy(TrainingTeam.training_id)
            .as("root_teams");

        const RootAssets = this.pool
            .select({
                assets_training_id: max(TrainingAsset.training_id).as('assets_training_id'),
                assets_id: sql<Array<number>>`coalesce(array_agg(assets.id), '{}'::INT[])`.as('assets_id'),
                assets: sql<Array<Static<typeof PartialAsset>>>`coalesce(json_agg(json_build_object(
                    'id', assets.id,
                    'name', assets.name,
                    'created', assets.created,
                    'updated', assets.updated,
                    'storage', assets.storage
                )), '[]'::JSON)`.as('assets'),
            })
            .from(Asset)
            .leftJoin(TrainingAsset, eq(Asset.id, TrainingAsset.asset_id))
            .groupBy(TrainingAsset.training_id)
            .as("root_assets");

        const RootUsers = this.pool
            .select({
                users_training_id: max(TrainingAssigned.training_id).as('users_training_id'),
                users: sql<Array<number>>`coalesce(array_agg(training_assigned.uid), '{}'::INT[])`.as('users'),
            })
            .from(TrainingAssigned)
            .groupBy(TrainingAssigned.training_id)
            .as("root_users");

        const pgres = await this.pool
            .select({
                id: Training.id,
                created: Training.created,
                updated: Training.updated,
                start_ts: Training.start_ts,
                end_ts: Training.end_ts,
                title: Training.title,
                body: Training.body,
                author: Training.author,
                location: Training.location,
                location_geom: Training.location_geom,
                required: Training.required,
                teams: RootTeams.teams,
                teams_id: RootTeams.teams_id,
                users: RootUsers.users,
                assets: RootAssets.assets,
                assets_id: RootAssets.assets_id
            })
            .from(Training)
            .leftJoin(RootTeams, eq(Training.id, RootTeams.teams_training_id))
            .leftJoin(RootUsers, eq(Training.id, RootUsers.users_training_id))
            .leftJoin(RootAssets, eq(Training.id, RootAssets.assets_training_id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        if (!pgres[0].teams_id) pgres[0].teams_id = [];
        if (!pgres[0].teams) pgres[0].teams = [];
        if (!pgres[0].users) pgres[0].users = [];
        if (!pgres[0].assets_id) pgres[0].assets_id = [];
        if (!pgres[0].assets) pgres[0].assets = [];

        return pgres[0] as Static<typeof AugmentedTraining>;
    }
}
