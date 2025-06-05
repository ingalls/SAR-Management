ALTER TABLE "rolodex" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rolodex" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "rolodex" ADD COLUMN "email" text;