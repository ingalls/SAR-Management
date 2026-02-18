CREATE TABLE IF NOT EXISTS "missions_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"asset_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certs" ALTER COLUMN "expiry" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "start_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "end_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "missions" ALTER COLUMN "start_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "missions" ALTER COLUMN "end_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules_event" ALTER COLUMN "start_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedules_event" ALTER COLUMN "end_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "training" ALTER COLUMN "start_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "training" ALTER COLUMN "end_ts" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users_reset" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "missions_assets" ADD CONSTRAINT "missions_assets_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "missions_assets" ADD CONSTRAINT "missions_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;