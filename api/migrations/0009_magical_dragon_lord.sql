ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "uid" integer;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
UPDATE assets SET uid = 1 WHERE uid IS NULL;
--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "uid" SET NOT NULL;