import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Training, TrainingTeam, TrainingAssigned, Team } from '../schema.js';
import { sql, eq, is, asc, desc, max, SQL, count } from 'drizzle-orm';

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
                users: RootUsers.users
            })
            .from(Training)
            .leftJoin(RootTeams, eq(Training.id, RootTeams.teams_training_id))
            .leftJoin(RootUsers, eq(Training.id, RootUsers.users_training_id))
            .as('root')

        const pgres = await this.pool.select()
            .from(Root)
            .where(query.where)
            //.orderBy(orderBy)
            .limit(query.limit || 10)
            .offset((query.page || 0) * (query.limit || 10))

        if (pgres.length === 0) {
            return { total: 0, items: [] };
        } else {
            return {
                total: parseInt(pgres[0].count),
                items: pgres.map((t) => {
                    delete t.count;
                    if (!t.teams) t.teams = [];

                    return t as Static<typeof AugmentedTraining>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedTraining>> {
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
                users: sql<Array<number>>`json_agg(training_assigned.uid)`.as('users'),
                teams: sql<Array<Static<typeof PartialTeam>>>`json_agg(json_build_object(
                    'id', teams.id,
                    'created', teams.created,
                    'updated', teams.updated,
                    'public', teams.public,
                    'colour_bg', teams.colour_bg,
                    'colour_txt', teams.colour_txt,
                    'fieldable', teams.fieldable
                ))`.as('teams'),
                teams_id: sql<Array<number>>`json_agg(teams.id)`,
            })
            .from(Training)
            .leftJoin(TrainingTeam, eq(Training.id, TrainingTeam.training_id))
            .leftJoin(Team, eq(Team.id, TrainingTeam.team_id))
            .leftJoin(TrainingAssigned, eq(TrainingAssigned.training_id, Training.id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1);

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedTraining>;
    }
}
