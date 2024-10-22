import Modeler, { GenericList, GenericListInput } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { User, TrainingAssigned } from '../schema.js';
import { sql, eq, is, asc, desc, SQL } from 'drizzle-orm';

export const AugmentedTrainingAssigned = Type.Object({
    id: Type.Integer(),
    training_id: Type.Integer(),
    uid: Type.Integer(),
    confirmed: Type.Boolean(),
    role: Type.String(),
    fname: Type.String(),
    lname: Type.String(),
    username: Type.String()
})

export default class TrainingAssignedModel extends Modeler<typeof TrainingAssigned> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, TrainingAssigned);
    }

    async augmented_list(query: GenericListInput = {}): Promise<GenericList<Static<typeof AugmentedTrainingAssigned>>> {
        const order = query.order && query.order === 'desc' ? desc : asc;
        const orderBy = order(query.sort ? this.key(query.sort) : this.requiredPrimaryKey());

        const pgres = await this.pool
            .select({
                count: sql<string>`count(*) OVER()`.as('count'),
                id: TrainingAssigned.id,
                training_id: TrainingAssigned.training_id,
                confirmed: TrainingAssigned.confirmed,
                role: TrainingAssigned.role,
                uid: TrainingAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(TrainingAssigned)
            .leftJoin(User, eq(TrainingAssigned.uid, User.id))
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
                    return t as Static<typeof AugmentedTrainingAssigned>
                })
            };
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof AugmentedTrainingAssigned>> {
        const pgres = await this.pool
            .select({
                id: TrainingAssigned.id,
                training_id: TrainingAssigned.training_id,
                confirmed: TrainingAssigned.confirmed,
                role: TrainingAssigned.role,
                uid: TrainingAssigned.uid,
                fname: User.fname,
                lname: User.lname,
                username: User.username
            })
            .from(TrainingAssigned)
            .leftJoin(User, eq(TrainingAssigned.uid, User.id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof AugmentedTrainingAssigned>;
    }
}
