ALTER TABLE "mission_tag" ADD COLUMN IF NOT EXISTS "colour_bg" text DEFAULT '#808080' NOT NULL;--> statement-breakpoint
ALTER TABLE "mission_tag" ADD COLUMN IF NOT EXISTS "colour_txt" text DEFAULT '#000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "training_tag" ADD COLUMN IF NOT EXISTS "colour_bg" text DEFAULT '#808080' NOT NULL;--> statement-breakpoint
ALTER TABLE "training_tag" ADD COLUMN IF NOT EXISTS "colour_txt" text DEFAULT '#000000' NOT NULL;
