ALTER TABLE "rolodex" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rolodex" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "rolodex" ADD COLUMN IF NOT EXISTS "email" text;