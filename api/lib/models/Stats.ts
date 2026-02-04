import { Pool } from '@openaddresses/batch-generic';
import { Mission, MissionAssigned, Training, TrainingAssigned } from '../schema.js';
import { sql, eq, and, gte, lte } from 'drizzle-orm';
import * as pgtypes from '../schema.js';

export default class StatsModel {
    pool: Pool<typeof pgtypes>;

    constructor(pool: Pool<typeof pgtypes>) {
        this.pool = pool;
    }

    async mission(start: string, end: string) {
        const missions = await this.pool.select({
            count: sql<number>`count(*)::int`
        }).from(Mission)
          .where(and(
              gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
              lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
          ));

        const hours = await this.pool.select({
            hours: sql<number>`sum(EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts})) / 3600)::int`
        }).from(Mission)
            .innerJoin(MissionAssigned, eq(Mission.id, MissionAssigned.mission_id))
            .where(and(
                gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
                lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
            ));

        return {
            count: missions[0].count,
            hours: hours[0].hours || 0
        }
    }

    async training(start: string, end: string) {
        const trainings = await this.pool.select({
            count: sql<number>`count(*)::int`
        }).from(Training)
           .where(and(
              gte(Training.start_ts, sql`${start}::TIMESTAMP`),
              lte(Training.end_ts, sql`${end}::TIMESTAMP`)
          ));

        const hours = await this.pool.select({
            hours: sql<number>`sum(EXTRACT(EPOCH FROM (${Training.end_ts} - ${Training.start_ts})) / 3600)::int`
        }).from(Training)
            .innerJoin(TrainingAssigned, eq(Training.id, TrainingAssigned.training_id))
            .where(and(
                gte(Training.start_ts, sql`${start}::TIMESTAMP`),
                lte(Training.end_ts, sql`${end}::TIMESTAMP`)
            ));
        
        return {
            count: trainings[0].count,
            hours: hours[0].hours || 0
        }
    }
}
