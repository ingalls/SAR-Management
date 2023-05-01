import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Location extends Generic {
    static _view = 'view_locations'

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'location' });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    location,
                    location_geom
                FROM (
                    SELECT
                        loc_idx,
                        MAX(location) AS location,
                        MAX(location_geom)::GEOMETRY(POINT, 4326) AS location_geom
                    FROM
                        view_locations
                    WHERE
                        (${query.filter}::TEXT IS NULL OR location ~* ${query.filter})
                    GROUP BY
                        loc_idx
                    ) t
                ORDER BY
                    ${sql.identifier([query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'locations');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Locations');
        }
    }
}
