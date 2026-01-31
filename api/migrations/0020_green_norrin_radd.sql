CREATE TABLE "equipment_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"equipment_id" integer NOT NULL,
	"mission_id" integer,
	"training_id" integer
);
--> statement-breakpoint
CREATE TABLE "users_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"uid" integer NOT NULL,
	"mission_id" integer,
	"training_id" integer
);
--> statement-breakpoint
ALTER TABLE "equipment_incidents" ADD CONSTRAINT "equipment_incidents_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_incidents" ADD CONSTRAINT "equipment_incidents_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_incidents" ADD CONSTRAINT "equipment_incidents_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_incidents" ADD CONSTRAINT "users_incidents_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_incidents" ADD CONSTRAINT "users_incidents_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_incidents" ADD CONSTRAINT "users_incidents_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;