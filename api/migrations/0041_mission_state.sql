CREATE TYPE "mission_state" AS ENUM ('triage', 'published');--> statement-breakpoint
-- Existing missions are already part of the visible record
ALTER TABLE "missions" ADD COLUMN IF NOT EXISTS "state" "mission_state" DEFAULT 'published' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "missions_state_idx" ON "missions" ("state");
