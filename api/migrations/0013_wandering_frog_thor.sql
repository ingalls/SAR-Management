CREATE TABLE IF NOT EXISTS "user_dashboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" integer NOT NULL,
	"name" text NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"w" integer NOT NULL,
	"h" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rolodex" ALTER COLUMN "remarks" SET DEFAULT '';--> statement-breakpointDO $$ BEGIN
 ALTER TABLE "user_dashboard" ADD CONSTRAINT "user_dashboard_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;