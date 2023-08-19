import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class MissionTeam extends Generic {
    static _table = 'missions_team';
}
