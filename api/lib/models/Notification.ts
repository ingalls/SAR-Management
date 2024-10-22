import Modeler from '@openaddresses/batch-generic';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Notification, User, UserTeam, Team } from '../schema.js';
import { sql, eq } from 'drizzle-orm';

export type UserList = {
    total: number;
    items: Array<{
        id: number;
        username: string;
        email: string;
        fname: string;
        lname: string;
        perm: string;
    }>
}

export default class NotificationModel extends Modeler<typeof Notification> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, Notification);
    }

    async users(type: string, perms: string[]): Promise<UserList> {
        const SubTable = this.pool.select({
            id: Team.id,
            perm: sql<string>`COALESCE(iam->>${type}::TEXT, 'None')`
        })
            .from(Team)
            .where(sql`COALESCE(iam->>${type}::TEXT, 'None') = ANY(${perms}::TEXT[])`)
            .as('a');

        const pgres = await this.pool.select({
            id: SubTable.id,
            username: User.username,
            email: User.email,
            fname: User.fname,
            lname: User.lname,
            perm: SubTable.perm
        }).from(SubTable)
            .innerJoin(UserTeam, eq(Team.id, UserTeam.tid))
            .leftJoin(User, eq(User.id, UserTeam.uid))

        return {
            total: pgres.length,
            // @ts-expect-error TODO Investigate
            items: pgres
        }
    }
}
