import Generic, { Params } from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

export default class TrainingTeam extends Generic {
    static _table = 'trainings_team';
}
