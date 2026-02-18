DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        ALTER TABLE "notes" RENAME TO "rolodex";
    END IF;
END $$;
