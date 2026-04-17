CREATE TABLE "schedules_override" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"start_ts" timestamp with time zone NOT NULL,
	"end_ts" timestamp with time zone NOT NULL,
	"uid" integer NOT NULL,
	"override_uid" integer,
	"reason" text DEFAULT '' NOT NULL,
	"created_by" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "rotation_type" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "rotation_period" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD CONSTRAINT "schedules_override_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD CONSTRAINT "schedules_override_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD CONSTRAINT "schedules_override_override_uid_users_id_fk" FOREIGN KEY ("override_uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD CONSTRAINT "schedules_override_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;