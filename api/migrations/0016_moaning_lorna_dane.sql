CREATE TABLE IF NOT EXISTS "trainings_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"asset_id" integer NOT NULL
);
--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "trainings_assets" ADD CONSTRAINT "trainings_assets_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "trainings_assets" ADD CONSTRAINT "trainings_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;