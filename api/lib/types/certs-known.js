import Generic, { Params } from '@openaddresses/batch-generic';
import { sql } from 'slonik';
import Err from '@openaddresses/batch-error';

export default class KnownCert extends Generic {
    static _table = 'certs_known';

    static async list(pool, query) {
        query.limit = Params.integer(query.limit, { default: 20 });
        query.page = Params.integer(query.page, { default: 0 });
        query.filter = Params.string(query.filter);
        query.sort = Params.string(query.sort, { default: 'created' });
        query.archived = Params.boolean(query.archived);
        query.order = Params.order(query.order);

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    certs_known.*
                FROM
                    certs_known
                WHERE
                    (${query.filter}::TEXT IS NULL OR name ~* ${query.filter})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'certs');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Known Certs');
        }
    }
}
