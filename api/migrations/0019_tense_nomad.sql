CREATE TABLE "training_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainings_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trainings_tag" ADD CONSTRAINT "trainings_tag_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings_tag" ADD CONSTRAINT "trainings_tag_tag_id_training_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."training_tag"("id") ON DELETE no action ON UPDATE no action;