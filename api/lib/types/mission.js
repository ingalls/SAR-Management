import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Mission extends Generic {
    static _table = 'missions';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        query.assigned = Params.integer(query.assigned);
        query.start = Params.timestamp(query.timestamp);
        query.end = Params.timestamp(query.timestamp);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    missions.*
                FROM
                    missions
                        LEFT JOIN (
                            SELECT
                                mission_id,
                                ARRAY_AGG(uid) AS users
                            FROM
                                missions_assigned
                            GROUP BY
                                mission_id
                        ) ma
                            ON missions.id = ma.mission_id
                WHERE
                    (${query.filter}::TEXT IS NULL OR title ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR ma.users @> ARRAY[${query.assigned}::BIGINT])
                    AND (${query.start}::TIMESTAMP IS NULL OR missions.start_ts >= ${query.start}::TIMESTAMP)
                    AND (${query.end}::TIMESTAMP IS NULL OR missions.end_ts <= ${query.end}::TIMESTAMP)
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Missions');
        }
    }
}
