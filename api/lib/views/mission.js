import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class ViewMission extends Generic {
    static _view = 'view_mission';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'start_ts' });
        query.order = Params.order(query.order);

        query.team = Params.integer(query.team);
        query.assigned = Params.integer(query.assigned);
        query.start = Params.timestamp(query.start);
        query.end = Params.timestamp(query.end);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    view_mission.*
                FROM
                    view_mission
                WHERE
                    (${query.filter}::TEXT IS NULL OR title ~* ${query.filter})
                    AND (${query.assigned}::BIGINT IS NULL OR users @> ARRAY[${query.assigned}::BIGINT])
                    AND (${query.team}::BIGINT IS NULL OR teams_id @> ARRAY[${query.team}::BIGINT])
                    AND (${query.start}::TIMESTAMP IS NULL OR start_ts >= ${query.start}::TIMESTAMP)
                    AND (${query.end}::TIMESTAMP IS NULL OR end_ts <= ${query.end}::TIMESTAMP)
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'missions');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Missions');
        }
    }
}
