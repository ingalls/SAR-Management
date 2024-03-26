import Modeler, { Param } from '@openaddresses/batch-generic';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as pgschema from '../schema.js';
import { sql, eq } from 'drizzle-orm';

export type LeaderList = {
    total: number;
    items: Array<{
        id: number;
        position: string;
        uid: number;
        name: string;
    }>
}

export default class LeadershipModel extends Modeler<typeof pgschema.Leadership> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, pgschema.Leadership);
    }

    async list(): Promise<LeaderList> {
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
}
