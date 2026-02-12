import Modeler from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { TeamSetting } from '../schema.js';
import { eq, and } from 'drizzle-orm';

export default class TeamSettingModel extends Modeler<typeof TeamSetting> {
    constructor(
        pool: PostgresJsDatabase<Record<string, unknown>>,
    ) {
        super(pool, TeamSetting);
    }

    async typed<T>(team_id: number, key: string, defaultValue?: T): Promise<{
        key: string,
        value: T
    }> {
        const pgres = await this.pool
        .select({
            key: TeamSetting.key,
            value: TeamSetting.value,
        })
        .from(TeamSetting)
        .where(and(
            eq(TeamSetting.team_id, team_id),
            eq(TeamSetting.key, key)
        ))
        .limit(1);

        if (pgres.length !== 1) {
            if (defaultValue !== undefined) {
                return { key, value: defaultValue }
            } else {
                throw new Err(404, null, `Item Not Found`);
            }
        }

        return {
            key: key,
            value: pgres[0].value as T
        }
    }
}
