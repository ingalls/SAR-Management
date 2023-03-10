import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class TeamFieldability extends Generic {
    static _table = 'fieldability';

    static async list(pool, teamid, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'name' });
        query.order = Params.order(query.order);
        query.teamid = Params.integer(teamid);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    fieldability.*
                FROM
                    fieldability
                WHERE
                    (${query.teamid}::BIGINT IS NULL OR team = ${query.teamid})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list Fieldability');
        }
    }
}
