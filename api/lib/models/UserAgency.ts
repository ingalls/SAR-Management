import Modeler from '@openaddresses/batch-generic';
import { UserAgency, Agency } from '../schema.js';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface UserAgencyAssociation {
    uid: number;
    agency_id: number;
    access: string;
    agency_name: string;
}

export default class UserAgencyModel extends Modeler<typeof UserAgency> {
    constructor(pool: PostgresJsDatabase<Record<string, unknown>>) {
        super(pool, UserAgency);
    }

    async listByUser(userId: number): Promise<{ total: number; items: UserAgencyAssociation[] }> {
        const results = await this.pool
            .select({
                uid: UserAgency.uid,
                agency_id: UserAgency.agency_id,
                access: UserAgency.access,
                agency_name: Agency.name
            })
            .from(UserAgency)
            .leftJoin(Agency, eq(UserAgency.agency_id, Agency.id))
            .where(
                and(
                    eq(UserAgency.uid, userId),
                    eq(Agency.archived, false)
                )
            )
            .orderBy(Agency.name);

        return {
            total: results.length,
            items: results
        };
    }

    async addAssociation(userId: number, agencyId: number, access: string): Promise<{ uid: number; agency_id: number; access: string }> {
        // Check if association already exists
        const existing = await this.pool
            .select()
            .from(UserAgency)
            .where(
                and(
                    eq(UserAgency.uid, userId),
                    eq(UserAgency.agency_id, agencyId)
                )
            );

        if (existing.length > 0) {
            throw new Error('User is already associated with this agency');
        }

        await this.pool
            .insert(UserAgency)
            .values({
                uid: userId,
                agency_id: agencyId,
                access: access
            });

        return {
            uid: userId,
            agency_id: agencyId,
            access: access
        };
    }

    async updateAccess(userId: number, agencyId: number, access: string): Promise<{ uid: number; agency_id: number; access: string }> {
        await this.pool
            .update(UserAgency)
            .set({ access: access })
            .where(
                and(
                    eq(UserAgency.uid, userId),
                    eq(UserAgency.agency_id, agencyId)
                )
            );

        return {
            uid: userId,
            agency_id: agencyId,
            access: access
        };
    }

    async removeAssociation(userId: number, agencyId: number): Promise<void> {
        await this.pool
            .delete(UserAgency)
            .where(
                and(
                    eq(UserAgency.uid, userId),
                    eq(UserAgency.agency_id, agencyId)
                )
            );
    }
}
