CREATE TABLE "users_external" (
	"uid" integer NOT NULL,
	"integration" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users_external" ADD CONSTRAINT "users_external_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;