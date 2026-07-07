CREATE TABLE "missions_to_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"agency_id" integer NOT NULL
);

CREATE TABLE "trainings_to_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"agency_id" integer NOT NULL
);

ALTER TABLE "missions_to_agencies" ADD CONSTRAINT "missions_to_agencies_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "missions_to_agencies" ADD CONSTRAINT "missions_to_agencies_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trainings_to_agencies" ADD CONSTRAINT "trainings_to_agencies_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trainings_to_agencies" ADD CONSTRAINT "trainings_to_agencies_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE cascade ON UPDATE no action;
