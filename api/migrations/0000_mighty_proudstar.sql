CREATE EXTENSION IF NOT EXISTS POSTGIS;

CREATE TABLE IF NOT EXISTS "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"meta" json DEFAULT '{}'::json NOT NULL,
	"schema" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "application_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"application" integer NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"body" text NOT NULL,
	"author" integer NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL,
	"storage" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"uid" integer NOT NULL,
	"known" integer,
	"name" text NOT NULL,
	"expiry" timestamp,
	"asset" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certs_known" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type_id" integer,
	"container" boolean DEFAULT false NOT NULL,
	"parent" integer,
	"meta" json DEFAULT '{}'::json NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"value" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment_assigned" (
	"id" serial PRIMARY KEY NOT NULL,
	"equip_id" integer NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"type" text NOT NULL,
	"schema" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fieldability" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"team" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"start_ts" timestamp,
	"end_ts" timestamp,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"author" integer NOT NULL,
	"poll_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues_assigned" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer NOT NULL,
	"uid" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue" integer NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"body" text NOT NULL,
	"author" integer NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadership" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" text NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"start_ts" timestamp NOT NULL,
	"end_ts" timestamp NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"author" integer NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"location_geom" geometry(Point, 4326),
	"externalid" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions_assigned" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"role" text NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mission_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_id" integer NOT NULL,
	"team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"uid" integer NOT NULL,
	"text" text NOT NULL,
	"url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll" (
	"id" serial PRIMARY KEY NOT NULL,
	"expiry" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"question" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_votes" (
	"uid" integer NOT NULL,
	"poll_id" integer NOT NULL,
	"question_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"name" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"handoff" text DEFAULT '06:00' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedules_assigned" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"role" text NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedules_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"start_ts" timestamp NOT NULL,
	"end_ts" timestamp NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server" (
	"key" text NOT NULL,
	"value" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spatial_ref_sys" (
	"srid" integer PRIMARY KEY NOT NULL,
	"auth_name" varchar(256),
	"auth_srid" integer,
	"srtext" varchar(2048),
	"proj4text" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"name" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"iam" json DEFAULT '{}'::json NOT NULL,
	"colour_bg" text DEFAULT '#808080' NOT NULL,
	"colour_txt" text DEFAULT '#000000' NOT NULL,
	"fieldable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"author" integer NOT NULL,
	"start_ts" timestamp NOT NULL,
	"end_ts" timestamp NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"location_geom" geometry(Point, 4326),
	"required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_assigned" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"role" text NOT NULL,
	"uid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trainings_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"access" text DEFAULT 'user' NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"fname" text NOT NULL,
	"lname" text NOT NULL,
	"phone" text NOT NULL,
	"bday" date,
	"validated" boolean DEFAULT false NOT NULL,
	"start_year" integer,
	"emergency" json DEFAULT '[]'::json NOT NULL,
	"address_street" text DEFAULT '' NOT NULL,
	"address_city" text DEFAULT '' NOT NULL,
	"address_state" text DEFAULT '' NOT NULL,
	"address_zip" text DEFAULT '' NOT NULL,
	"last_login" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_reset" (
	"uid" integer NOT NULL,
	"expires" timestamp NOT NULL,
	"token" text NOT NULL,
	"action" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"key" text NOT NULL,
	"value" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_teams" (
	"uid" integer NOT NULL,
	"tid" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_comments" ADD CONSTRAINT "application_comments_application_applications_id_fk" FOREIGN KEY ("application") REFERENCES "applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_comments" ADD CONSTRAINT "application_comments_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certs" ADD CONSTRAINT "certs_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certs" ADD CONSTRAINT "certs_known_certs_known_id_fk" FOREIGN KEY ("known") REFERENCES "certs_known"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certs" ADD CONSTRAINT "certs_asset_assets_id_fk" FOREIGN KEY ("asset") REFERENCES "assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment" ADD CONSTRAINT "equipment_type_id_equipment_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "equipment_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment" ADD CONSTRAINT "equipment_parent_equipment_id_fk" FOREIGN KEY ("parent") REFERENCES "equipment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment_assigned" ADD CONSTRAINT "equipment_assigned_equip_id_equipment_id_fk" FOREIGN KEY ("equip_id") REFERENCES "equipment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment_assigned" ADD CONSTRAINT "equipment_assigned_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fieldability" ADD CONSTRAINT "fieldability_team_teams_id_fk" FOREIGN KEY ("team") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_assigned" ADD CONSTRAINT "issues_assigned_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_assigned" ADD CONSTRAINT "issues_assigned_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_comments" ADD CONSTRAINT "issues_comments_issue_issues_id_fk" FOREIGN KEY ("issue") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_comments" ADD CONSTRAINT "issues_comments_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leadership" ADD CONSTRAINT "leadership_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "missions" ADD CONSTRAINT "missions_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "missions_assigned" ADD CONSTRAINT "missions_assigned_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "missions_assigned" ADD CONSTRAINT "missions_assigned_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "missions_team" ADD CONSTRAINT "missions_team_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "missions_team" ADD CONSTRAINT "missions_team_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_questions" ADD CONSTRAINT "poll_questions_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_question_id_poll_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "poll_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules_assigned" ADD CONSTRAINT "schedules_assigned_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules_assigned" ADD CONSTRAINT "schedules_assigned_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules_event" ADD CONSTRAINT "schedules_event_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules_event" ADD CONSTRAINT "schedules_event_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training" ADD CONSTRAINT "training_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_assigned" ADD CONSTRAINT "training_assigned_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "training_assigned" ADD CONSTRAINT "training_assigned_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trainings_team" ADD CONSTRAINT "trainings_team_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trainings_team" ADD CONSTRAINT "trainings_team_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_reset" ADD CONSTRAINT "users_reset_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_tid_teams_id_fk" FOREIGN KEY ("tid") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
