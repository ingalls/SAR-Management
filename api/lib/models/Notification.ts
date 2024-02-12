import Modeler, { Param } from '@openaddresses/batch-generic';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Notification, User, UserTeam } from '../schema.js';
import { sql, eq } from 'drizzle-orm';

export type UserList = {
    total: number;
    items: Array<{
        chatroom: string;
    }>
}

export default class NotificationModel extends Modeler<typeof Notification> {
    constructor(
        pool: PostgresJsDatabase<any>,
    ) {
        super(pool, Notification);
    }

    async users(type: string, perms: string[]): Promise<UserList> {
        const Subtable = this.pool.select(
            id: Team.id,
            perm: sql`COALESCE(iam->>${type}::TEXT, 'None')`
        )
            .from(Team)
            .where(sql`COALESCE(iam->>'Application', 'None') = ANY(${perms}::TEXT[])`)
            .as('a');

        const pgres = await this.pool.select(
            id: Subtable.id,
            username: User.username,
            email: User.email,
            fname: User.fname,
            lname: User.lname,
            perm:
        }).from(subtable)
            .leftJoin(UserTeam, eq(Team.id, UserTeam.tid))
            .leftJoin(User, eq(User.id, UserTeam.uid))

        return {
            total: pgres.length,
            items: pgres
        }
    }
}
