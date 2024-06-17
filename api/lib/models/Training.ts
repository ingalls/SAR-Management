import Modeler, { Param, GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Training, TrainingTeam, TrainingAssigned, Team } from '../schema.js';
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
    users: Type.Array(Type.Integer()),
    teams: Type.Array(PartialTeam),
    teams_id: Type.Array(Type.Integer())
});

export default class TrainingModel extends Modeler<typeof Training> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, Training);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedTraining>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());


        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
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
                teams_id: sql<Array<number>>`json_agg(teams.id)`
            })
            .from(Training)
            .leftJoin(TrainingTeam, eq(Training.id, TrainingTeam.training_id))
            .leftJoin(Team, eq(Team.id, TrainingTeam.team_id))
            .leftJoin(TrainingAssigned, eq(TrainingAssigned.training_id, Training.id))
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
