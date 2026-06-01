ALTER TABLE "schedule" ADD COLUMN "team_id" integer;--> statement-breakpoint
UPDATE "schedule" SET "team_id" = candidate."team_id"
FROM (
	SELECT "schedules_assigned"."schedule_id", min("users_to_teams"."tid") AS "team_id"
	FROM "schedules_assigned"
	INNER JOIN "users_to_teams" ON "users_to_teams"."uid" = "schedules_assigned"."uid"
	GROUP BY "schedules_assigned"."schedule_id"
) AS candidate
WHERE "schedule"."id" = candidate."schedule_id";--> statement-breakpoint
UPDATE "schedule" SET "team_id" = (SELECT "id" FROM "teams" ORDER BY "id" LIMIT 1) WHERE "team_id" IS NULL;--> statement-breakpoint
ALTER TABLE "schedule" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules_assigned" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "schedules_assigned" CASCADE;--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;