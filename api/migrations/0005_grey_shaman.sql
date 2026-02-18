ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "group" text DEFAULT 'unassigned' NOT NULL;
