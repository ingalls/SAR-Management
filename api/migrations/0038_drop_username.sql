ALTER TABLE "users" DROP COLUMN IF EXISTS "username";--> statement-breakpoint
UPDATE "server" SET "key" = 'login_email_label' WHERE "key" = 'login_username_label' AND NOT EXISTS (SELECT 1 FROM "server" WHERE "key" = 'login_email_label');--> statement-breakpoint
DELETE FROM "server" WHERE "key" = 'login_username_label';
