import Generic from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class TeamUser extends Generic {
    static _table = 'users_to_teams';

    static async remove(pool, teamid, userid) {
        try {
            await pool.query(sql`
                DELETE FROM
                    users_to_teams
                WHERE
                    uid = ${userid}
                    AND tid = ${teamid}
            `);
        } catch (err) {
            console.error(err);
            throw new Err(400, err, 'Failed to remove user from team');
        }
    }
}
