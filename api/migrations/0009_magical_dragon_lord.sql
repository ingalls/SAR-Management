ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "uid" integer;--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

UPDATE assets SET uid = 1;

ALTER TABLE "assets" ALTER COLUMN "uid" SET NOT NULL;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;