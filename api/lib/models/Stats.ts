import { Pool } from '@openaddresses/batch-generic';
import { Mission, MissionAssigned, MissionTag, MissionTagAssigned, Training, TrainingAssigned, TrainingTag, TrainingTagAssigned } from '../schema.js';
import { sql, eq, and, gte, lte, desc } from 'drizzle-orm';
import * as pgtypes from '../schema.js';

export default class StatsModel {
    pool: Pool<typeof pgtypes>;

    constructor(pool: Pool<typeof pgtypes>) {
        this.pool = pool;
    }

    async mission(start: string, end: string) {
        const stats = await this.pool.select({
            count: sql<number>`count(*)::int`,
            average: sql<number>`avg(EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts})) / 3600)::int`
        }).from(Mission)
          .where(and(
              gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
              lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
          ));

        const longest = await this.pool.select({
            id: Mission.id,
            name: Mission.title,
            hours: sql<number>`(EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts})) / 3600)::int`
        }).from(Mission)
          .where(and(
              gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
              lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
          ))
          .orderBy(desc(sql`EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts}))`))
          .limit(1);

        const hours = await this.pool.select({
            hours: sql<number>`sum(EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts})) / 3600)::int`
        }).from(Mission)
            .innerJoin(MissionAssigned, eq(Mission.id, MissionAssigned.mission_id))
            .where(and(
                gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
                lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
            ));

        const tags = await this.pool.select({
            id: MissionTag.id,
            name: MissionTag.name,
            icon: MissionTag.icon,
            colour_bg: MissionTag.colour_bg,
            colour_txt: MissionTag.colour_txt,
            count: sql<number>`count(distinct ${Mission.id})::int`,
            hours: sql<number>`coalesce(sum(CASE WHEN ${MissionAssigned.id} IS NULL THEN 0 ELSE EXTRACT(EPOCH FROM (${Mission.end_ts} - ${Mission.start_ts})) / 3600 END), 0)::int`
        }).from(MissionTag)
            .innerJoin(MissionTagAssigned, eq(MissionTag.id, MissionTagAssigned.tag_id))
            .innerJoin(Mission, eq(Mission.id, MissionTagAssigned.mission_id))
            .leftJoin(MissionAssigned, eq(Mission.id, MissionAssigned.mission_id))
            .where(and(
                gte(Mission.start_ts, sql`${start}::TIMESTAMP`),
                lte(Mission.end_ts, sql`${end}::TIMESTAMP`)
            ))
            .groupBy(MissionTag.id)
            .orderBy(desc(sql`count(distinct ${Mission.id})`), MissionTag.name);

        return {
            count: stats[0].count,
            longest_mission: longest.length ? longest[0] : undefined,
            average: stats[0].average || 0,
            hours: hours[0].hours || 0,
            tags
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
        
        const tags = await this.pool.select({
            id: TrainingTag.id,
            name: TrainingTag.name,
            icon: TrainingTag.icon,
            colour_bg: TrainingTag.colour_bg,
            colour_txt: TrainingTag.colour_txt,
            count: sql<number>`count(distinct ${Training.id})::int`,
            hours: sql<number>`coalesce(sum(CASE WHEN ${TrainingAssigned.id} IS NULL THEN 0 ELSE EXTRACT(EPOCH FROM (${Training.end_ts} - ${Training.start_ts})) / 3600 END), 0)::int`
        }).from(TrainingTag)
            .innerJoin(TrainingTagAssigned, eq(TrainingTag.id, TrainingTagAssigned.tag_id))
            .innerJoin(Training, eq(Training.id, TrainingTagAssigned.training_id))
            .leftJoin(TrainingAssigned, eq(Training.id, TrainingAssigned.training_id))
            .where(and(
                gte(Training.start_ts, sql`${start}::TIMESTAMP`),
                lte(Training.end_ts, sql`${end}::TIMESTAMP`)
            ))
            .groupBy(TrainingTag.id)
            .orderBy(desc(sql`count(distinct ${Training.id})`), TrainingTag.name);

        return {
            count: trainings[0].count,
            hours: hours[0].hours || 0,
            tags
        }
    }
}
