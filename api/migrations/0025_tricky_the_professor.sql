CREATE TABLE IF NOT EXISTS "teams_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"key" text NOT NULL,
	"value" text DEFAULT '' NOT NULL
);
--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "teams_settings" ADD CONSTRAINT "teams_settings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;