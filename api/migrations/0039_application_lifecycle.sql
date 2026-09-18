ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'submitted' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "assigned" integer REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "group" TO "cohort";--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "meta" TO "answers";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "application_events" (
    "id" serial PRIMARY KEY NOT NULL,
    "application" integer NOT NULL REFERENCES "applications"("id"),
    "created" timestamp with time zone DEFAULT Now() NOT NULL,
    "author" integer REFERENCES "users"("id"),
    "type" text NOT NULL,
    "body" text DEFAULT '' NOT NULL,
    "meta" json DEFAULT '{}'::json NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "application_events_application_idx" ON "application_events" ("application");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "application_comments_application_idx" ON "application_comments" ("application");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications" ("status");--> statement-breakpoint

-- Answers were frequently written as a JSON encoded string instead of an object and
-- can contain NULL bytes pasted in from PDFs, which Postgres cannot convert to text
UPDATE "applications"
    SET "answers" = (
        CASE WHEN json_typeof("answers") = 'string'
            THEN replace(replace("answers"::TEXT, '\\u0000', '')::JSON #>> '{}', '\u0000', '')
            ELSE replace("answers"::TEXT, '\u0000', '')
        END
    )::JSON;--> statement-breakpoint
UPDATE "applications"
    SET "schema" = ("schema" #>> '{}')::JSON
    WHERE json_typeof("schema") = 'string';--> statement-breakpoint

-- Cohort is now set by reviewers, remove it from the form snapshots & the public form
-- The objects are rebuilt as JSON, as JSONB would reorder the form fields
UPDATE "applications"
    SET "schema" = (
        SELECT json_object_agg(t.key, CASE
            WHEN t.key = 'properties' AND json_typeof(t.value) = 'object' THEN COALESCE((
                SELECT json_object_agg(p.key, p.value ORDER BY p.ord)
                FROM json_each(t.value) WITH ORDINALITY AS p(key, value, ord)
                WHERE p.key <> 'group'
            ), '{}'::JSON)
            WHEN t.key = 'required' AND json_typeof(t.value) = 'array' THEN COALESCE((
                SELECT json_agg(r.value ORDER BY r.ord)
                FROM json_array_elements(t.value) WITH ORDINALITY AS r(value, ord)
                WHERE r.value::TEXT <> '"group"'
            ), '[]'::JSON)
            ELSE t.value
        END ORDER BY t.ord)
        FROM json_each("schema") WITH ORDINALITY AS t(key, value, ord)
    )
    WHERE json_typeof("schema") = 'object'
        AND json_typeof("schema" -> 'properties') = 'object'
        AND ("schema" -> 'properties' -> 'group') IS NOT NULL;--> statement-breakpoint
UPDATE "server"
    SET "value" = (
        SELECT json_object_agg(t.key, CASE
            WHEN t.key = 'properties' AND json_typeof(t.value) = 'object' THEN COALESCE((
                SELECT json_object_agg(p.key, p.value ORDER BY p.ord)
                FROM json_each(t.value) WITH ORDINALITY AS p(key, value, ord)
                WHERE p.key <> 'group'
            ), '{}'::JSON)
            WHEN t.key = 'required' AND json_typeof(t.value) = 'array' THEN COALESCE((
                SELECT json_agg(r.value ORDER BY r.ord)
                FROM json_array_elements(t.value) WITH ORDINALITY AS r(value, ord)
                WHERE r.value::TEXT <> '"group"'
            ), '[]'::JSON)
            ELSE t.value
        END ORDER BY t.ord)
        FROM json_each("value"::JSON) WITH ORDINALITY AS t(key, value, ord)
    )::TEXT
    WHERE "key" = 'application'
        AND json_typeof("value"::JSON -> 'properties') = 'object'
        AND ("value"::JSON -> 'properties' -> 'group') IS NOT NULL;--> statement-breakpoint

-- Archived applications whose phone or email matches exactly one member were onboarded
UPDATE "applications" a
    SET "user_id" = m.uid, "status" = 'onboarded'
    FROM (
        SELECT a2.id AS aid, MIN(u.id) AS uid
        FROM "applications" a2
        JOIN "users" u ON (
            lower(u.email) = lower(a2.email)
            OR (
                length(regexp_replace(a2.phone, '\D', '', 'g')) >= 10
                AND right(regexp_replace(u.phone, '\D', '', 'g'), 10) = right(regexp_replace(a2.phone, '\D', '', 'g'), 10)
            )
        )
        WHERE a2.archived
        GROUP BY a2.id
        HAVING COUNT(DISTINCT u.id) = 1
    ) m
    WHERE a.id = m.aid;--> statement-breakpoint
-- The outcome of the remaining archived applications was never recorded
UPDATE "applications" SET "status" = 'closed' WHERE "archived" AND "status" = 'submitted';--> statement-breakpoint
-- Open applications that reviewers have already discussed are under review
UPDATE "applications" a
    SET "status" = 'reviewing'
    WHERE NOT a."archived"
        AND a."status" = 'submitted'
        AND EXISTS (SELECT 1 FROM "application_comments" c WHERE c.application = a.id AND NOT c.archived);--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN IF EXISTS "archived";
