CREATE TABLE "missions_patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"dob" text,
	"address_street" text,
	"address_state" text,
	"address_postcode" text,
	"address_country" text
);
--> statement-breakpoint
ALTER TABLE "missions_patients" ADD CONSTRAINT "missions_patients_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;