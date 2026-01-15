CREATE TABLE "users_sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"ip" text NOT NULL,
	"ua" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_secret" text;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;