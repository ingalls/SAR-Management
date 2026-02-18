ALTER TABLE "mission_role" ADD COLUMN IF NOT EXISTS "icon" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "mission_tag" ADD COLUMN IF NOT EXISTS "icon" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "training_tag" ADD COLUMN IF NOT EXISTS "icon" text DEFAULT '' NOT NULL;