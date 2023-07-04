import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class Training extends Generic {
    static _table = 'training';

    async delete(opts = {}) {
        try {
            await this._pool.query(sql`
                DELETE FROM trainings_team
                    WHERE
                        training_id = ${this.id}
            `);

            await this._pool.query(sql`
                DELETE FROM training_assigned
                    WHERE
                        training_id = ${this.id}
            `);

            await this._pool.query(sql`
                DELETE FROM ${sql.identifier([this._table])}
                    WHERE
                        id = ${this.id}
            `);

            return true;
        } catch (err) {
            throw new Err(500, new Error(err), `Failed to delete from ${this._table}`);
        }
    }
}
