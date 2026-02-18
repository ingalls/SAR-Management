CREATE TABLE IF NOT EXISTS "training_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trainings_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "trainings_tag" ADD CONSTRAINT "trainings_tag_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "trainings_tag" ADD CONSTRAINT "trainings_tag_tag_id_training_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."training_tag"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;