CREATE TABLE IF NOT EXISTS "mission_person" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text,
	"address" text,
	"role" text,
	"phone" text,
	"email" text,
	"notes" text
);
--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "mission_person" ADD CONSTRAINT "mission_person_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;