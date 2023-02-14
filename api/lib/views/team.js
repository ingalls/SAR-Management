import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class ViewTeam extends Generic {
    static _view = 'view_teams';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);
        query.userid = Params.integer(query.userid);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    view_teams.*
                FROM
                    view_teams
                        LEFT JOIN users_to_teams utt
                            ON view_teams.id = utt.tid
                WHERE
                    (${query.filter}::TEXT IS NULL OR name ~* ${query.filter})
                    AND (${query.userid}::BIGINT IS NULL OR utt.uid = ${query.userid})
                GROUP BY
                    view_teams.id,
                    view_teams.created,
                    view_teams.updated,
                    view_teams.public,
                    view_teams.members,
                    view_teams.name,
                    view_teams.body
                ORDER BY
                    ${sql.identifier([this._view, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Teams');
        }
    }
}
