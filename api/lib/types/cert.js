import Generic, { Params } from '@openaddresses/batch-generic';

export default class User extends Generic {
    static _table = 'certs';

    static async list(pool, query) {
        query.uid = Params.integer(query.uid);
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    schedule.*
                FROM
                    schedule
                WHERE
                    (${query.uid}::BIGINT IS NULL OR uid = ${query.uid})
                    (${query.filter}::TEXT IS NULL OR name ~* ${query.filter})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'schedules');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Schedules');
        }
    }
}
