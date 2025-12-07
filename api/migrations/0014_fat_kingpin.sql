-- Custom SQL migration file, put your code below! --
ALTER TABLE users_reset
    ALTER COLUMN expires TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING expires AT TIME ZONE 'America/Denver';

ALTER TABLE training                                                                                                                                                                                                   
    ALTER COLUMN start_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING start_ts AT TIME ZONE 'America/Denver';
                                                                                                                                                                                                                       
ALTER TABLE training                                                                                                                                                                                                   
    ALTER COLUMN end_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING end_ts AT TIME ZONE 'America/Denver';

ALTER TABLE certs
    ALTER COLUMN expiry TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING expiry AT TIME ZONE 'America/Denver';

ALTER TABLE issues
    ALTER COLUMN start_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING start_ts AT TIME ZONE 'America/Denver';

ALTER TABLE issues
    ALTER COLUMN end_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING end_ts AT TIME ZONE 'America/Denver';

ALTER TABLE missions
    ALTER COLUMN start_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING start_ts AT TIME ZONE 'America/Denver';

ALTER TABLE missions
    ALTER COLUMN end_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING end_ts AT TIME ZONE 'America/Denver';

ALTER TABLE schedules_event
    ALTER COLUMN start_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING start_ts AT TIME ZONE 'America/Denver';

ALTER TABLE schedules_event
    ALTER COLUMN end_ts TYPE TIMESTAMPTZ                                                                                                                                                                               
    USING end_ts AT TIME ZONE 'America/Denver';
