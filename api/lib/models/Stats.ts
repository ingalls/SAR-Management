import { Pool } from '@openaddresses/batch-generic';
import { Mission, Training } from '../schema.js';
import { sql, and, gte, lte } from 'drizzle-orm';
import * as pgtypes from '../schema.js';

export default class StatsModel {
    pool: Pool<typeof pgtypes>;

    constructor(pool: Pool<typeof pgtypes>) {
        this.pool = pool;
    }

    async generate(start: string, end: string) {
        const missions = await this.pool.select({
            count: sql<number>`count(*)::int`
        }).from(Mission)
          .where(and(
              gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
              lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
          ));

        const trainings = await this.pool.select({
            count: sql<number>`count(*)::int`
        }).from(Training)
           .where(and(
              gte(Training.start_ts, sql`${start}::TIMESTAMP`),
              lte(Training.end_ts, sql`${end}::TIMESTAMP`)
          ));
        
        return {
            missions: missions[0].count,
            trainings: trainings[0].count
        }
    }
}
