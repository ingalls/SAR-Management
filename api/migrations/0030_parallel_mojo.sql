CREATE TABLE "agency" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL,
	"location_geom" GEOMETRY(POINT, 4326),
	"logo" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_agencies" (
	"uid" integer NOT NULL,
	"agency_id" bigint NOT NULL,
	"access" text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "application_comments" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "certs" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "certs_known" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "equipment_assigned" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "equipment_incidents" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "equipment_types" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "fieldability" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "issues_assigned" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "issues_comments" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "leadership" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions_assets" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions_assigned" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions_patients" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "mission_person" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "mission_role" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "mission_tag" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions_tag" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "missions_team" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "poll" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "poll_questions" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "rolodex" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "schedules_event" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "server" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "teams_channels" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "teams_settings" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "training" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "trainings_assets" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "training_assigned" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "training_tag" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "trainings_tag" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "trainings_team" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "user_dashboard" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_external" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_incidents" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_reset" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD COLUMN "agency_id" bigint;--> statement-breakpoint
ALTER TABLE "users_to_agencies" ADD CONSTRAINT "users_to_agencies_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_agencies" ADD CONSTRAINT "users_to_agencies_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_comments" ADD CONSTRAINT "application_comments_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certs" ADD CONSTRAINT "certs_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certs_known" ADD CONSTRAINT "certs_known_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_assigned" ADD CONSTRAINT "equipment_assigned_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_incidents" ADD CONSTRAINT "equipment_incidents_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_types" ADD CONSTRAINT "equipment_types_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fieldability" ADD CONSTRAINT "fieldability_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues_assigned" ADD CONSTRAINT "issues_assigned_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues_comments" ADD CONSTRAINT "issues_comments_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leadership" ADD CONSTRAINT "leadership_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_assets" ADD CONSTRAINT "missions_assets_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_assigned" ADD CONSTRAINT "missions_assigned_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_patients" ADD CONSTRAINT "missions_patients_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_person" ADD CONSTRAINT "mission_person_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_role" ADD CONSTRAINT "mission_role_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_tag" ADD CONSTRAINT "mission_tag_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_tag" ADD CONSTRAINT "missions_tag_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions_team" ADD CONSTRAINT "missions_team_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_questions" ADD CONSTRAINT "poll_questions_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolodex" ADD CONSTRAINT "rolodex_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules_event" ADD CONSTRAINT "schedules_event_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules_override" ADD CONSTRAINT "schedules_override_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server" ADD CONSTRAINT "server_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_channels" ADD CONSTRAINT "teams_channels_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_settings" ADD CONSTRAINT "teams_settings_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings_assets" ADD CONSTRAINT "trainings_assets_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_assigned" ADD CONSTRAINT "training_assigned_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_tag" ADD CONSTRAINT "training_tag_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings_tag" ADD CONSTRAINT "trainings_tag_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings_team" ADD CONSTRAINT "trainings_team_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboard" ADD CONSTRAINT "user_dashboard_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_external" ADD CONSTRAINT "users_external_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_incidents" ADD CONSTRAINT "users_incidents_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_reset" ADD CONSTRAINT "users_reset_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;
