import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Location {
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
                    *
                FROM (
                    SELECT
                        MAX(location) AS location,
                        MAX(location_geom) AS location_geom
                    FROM (
                            (
                                SELECT
                                    location,
                                    LOWER(location) AS loc_idx,
                                    location_geom
                                FROM
                                    missions
                                WHERE
                                    location_geom IS NOT NULL
                                    AND Length(Trim(location)) > 0
                            ) UNION (
                                SELECT
                                    location,
                                    LOWER(location) AS loc_idx,
                                    location_geom
                                FROM
                                    training
                                WHERE
                                    location_geom IS NOT NULL
                                    AND Length(Trim(location)) > 0
                            )
                        ) m
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

            return {
                total: pgres.rows[0].count,
                locations: pgres.rows
            }
        } catch (err) {
            throw new Err(500, err, 'Failed to list Locations');
        }
    }
}
