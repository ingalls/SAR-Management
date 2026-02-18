ALTER TABLE "schedule" ADD COLUMN IF NOT EXISTS "disabled" boolean DEFAULT false NOT NULL;
