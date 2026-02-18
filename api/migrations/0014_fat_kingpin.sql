-- Custom SQL migration file, put your code below! --

DO $$
BEGIN
    -- users_reset.expires
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users_reset' 
          AND column_name = 'expires' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE users_reset
            ALTER COLUMN expires TYPE TIMESTAMPTZ
            USING expires AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- training.start_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'training' 
          AND column_name = 'start_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE training
            ALTER COLUMN start_ts TYPE TIMESTAMPTZ
            USING start_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- training.end_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'training' 
          AND column_name = 'end_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE training
            ALTER COLUMN end_ts TYPE TIMESTAMPTZ
            USING end_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- certs.expiry
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'certs' 
          AND column_name = 'expiry' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE certs
            ALTER COLUMN expiry TYPE TIMESTAMPTZ
            USING expiry AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- issues.start_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'issues' 
          AND column_name = 'start_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE issues
            ALTER COLUMN start_ts TYPE TIMESTAMPTZ
            USING start_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- issues.end_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'issues' 
          AND column_name = 'end_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE issues
            ALTER COLUMN end_ts TYPE TIMESTAMPTZ
            USING end_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- missions.start_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'missions' 
          AND column_name = 'start_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE missions
            ALTER COLUMN start_ts TYPE TIMESTAMPTZ
            USING start_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- missions.end_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'missions' 
          AND column_name = 'end_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE missions
            ALTER COLUMN end_ts TYPE TIMESTAMPTZ
            USING end_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- schedules_event.start_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'schedules_event' 
          AND column_name = 'start_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE schedules_event
            ALTER COLUMN start_ts TYPE TIMESTAMPTZ
            USING start_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;

DO $$
BEGIN
    -- schedules_event.end_ts
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'schedules_event' 
          AND column_name = 'end_ts' 
          AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE schedules_event
            ALTER COLUMN end_ts TYPE TIMESTAMPTZ
            USING end_ts AT TIME ZONE 'America/Denver';
    END IF;
END $$;
