import Modeler, { Param } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { Static, Type } from '@sinclair/typebox';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as pgschema from '../schema.js';
import { sql, eq, is, SQL } from 'drizzle-orm';

export const Leader = Type.Object({
    id: Type.Integer(),
    position: Type.String(),
    uid: Type.Integer(),
    name: Type.String()
});

export const LeaderList = Type.Object({
    total: Type.Integer(),
    items: Type.Array(Leader)
});

export default class LeadershipModel extends Modeler<typeof pgschema.Leadership> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, pgschema.Leadership);
    }

    async augmented_list(): Promise<Static<typeof LeaderList>> {
        const pgres = await this.pool.select({
            id: pgschema.Leadership.id,
            position: pgschema.Leadership.position,
            uid: pgschema.Leadership.uid,
            name: sql<string>`users.fname || ' ' || users.lname`
        })
            .from(pgschema.Leadership)
            .leftJoin(pgschema.User, eq(pgschema.Leadership.uid, pgschema.User.id))

        return {
            total: pgres.length,
            items: pgres
        }
    }

    async augmented_from(id: unknown | SQL<unknown>): Promise<Static<typeof Leader>> {
        const pgres = await this.pool.select({
            id: pgschema.Leadership.id,
            position: pgschema.Leadership.position,
            uid: pgschema.Leadership.uid,
            name: sql<string>`users.fname || ' ' || users.lname`
        })
            .from(pgschema.Leadership)
            .leftJoin(pgschema.User, eq(pgschema.Leadership.uid, pgschema.User.id))
            .where(is(id, SQL)? id as SQL<unknown> : eq(this.requiredPrimaryKey(), id))
            .limit(1)

        if (pgres.length !== 1) throw new Err(404, null, `Item Not Found`);

        return pgres[0] as Static<typeof Leader>;
    }
}
