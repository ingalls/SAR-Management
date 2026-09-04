import Err from '@openaddresses/batch-error';
import { sql, SQL } from 'drizzle-orm';
import { AuthUser } from './auth.js';
import Config from './config.js';

/**
 * Agency based sharing rules for Rolodex items
 *
 * - Site admins can see & manage every item
 * - An item shared with no agencies is visible to the whole organization
 * - An item shared with one or more agencies is visible to members of those agencies
 * - The author of an item can always see it
 */
export default class RolodexAccess {
    static async agencyIds(config: Config, user: AuthUser): Promise<Array<number>> {
        const agencies = await config.models.UserAgency.listByUser(user.id);
        return agencies.items.map((ua) => ua.agency_id);
    }

    static isAdmin(user: AuthUser): boolean {
        return user.access === 'admin';
    }

    /**
     * SQL fragment restricting an augmented list to the items visible to a user
     */
    static async visibleWhere(config: Config, user: AuthUser): Promise<SQL> {
        if (RolodexAccess.isAdmin(user)) return sql`True`;

        const ids = await RolodexAccess.agencyIds(config, user);

        return sql`(
            coalesce(cardinality(agencies_id), 0) = 0
            OR agencies_id && ${sql.raw(`ARRAY[${ids.map((id) => Number(id)).join(',')}]::INT[]`)}
            OR author = ${user.id}
        )`;
    }

    static async canView(config: Config, user: AuthUser, item: {
        author: number | null,
        agencies_id: Array<number>
    }): Promise<boolean> {
        if (RolodexAccess.isAdmin(user)) return true;
        if (item.author === user.id) return true;
        if (!item.agencies_id.length) return true;

        const ids = await RolodexAccess.agencyIds(config, user);
        return item.agencies_id.some((id) => ids.includes(id));
    }

    static async assertView(config: Config, user: AuthUser, item: {
        author: number | null,
        agencies_id: Array<number>
    }): Promise<void> {
        if (!await RolodexAccess.canView(config, user, item)) {
            throw new Err(403, null, 'This Rolodex item is not shared with any of your agencies');
        }
    }

    /**
     * When agencies are set, at least one must belong to the user so an item
     * cannot be shared away to agencies the user is not a member of
     */
    static async assertShare(config: Config, user: AuthUser, agencies: Array<number>): Promise<void> {
        if (RolodexAccess.isAdmin(user)) return;
        if (!agencies.length) return;

        const ids = await RolodexAccess.agencyIds(config, user);
        if (!agencies.some((id) => ids.includes(id))) {
            throw new Err(400, null, 'At least one agency must belong to you');
        }
    }
}
