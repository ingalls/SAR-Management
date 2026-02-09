CREATE TABLE "teams_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"channel_id" text NOT NULL,
	"channel_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams_channels" ADD CONSTRAINT "teams_channels_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;