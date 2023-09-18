import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class ScheduleAssigned extends Generic {
    static _table = 'schedules_assigned';

    static async list(pool, schedule_id, query) {
        schedule_id = Params.integer(schedule_id);

        query.limit = Params.integer(query.limit, { default: 100 });
        query.page = Params.integer(query.page, { default: 0 });
        query.sort = Params.string(query.sort, { default: 'id' });
        query.order = Params.order(query.order);
        query.filter = Params.string(query.filter, { default: '' });

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    schedules_assigned.*,
                    users.fname,
                    users.lname,
                    users.username
                FROM
                    ${sql.identifier([this._table])}
                        LEFT JOIN users
                            ON schedules_assigned.uid = users.id
                WHERE
                    schedule_id = ${schedule_id}
                    AND (${query.filter}::TEXT IS NULL OR fname||' '||lname ~* ${query.filter})
                ORDER BY
                    ${sql.identifier([this._table, query.sort])} ${query.order}
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'assigned');
        } catch (err) {
            throw new Err(500, err, 'Failed to list Schedule Asignees');
        }
    }
}
