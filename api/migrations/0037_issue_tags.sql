CREATE TABLE IF NOT EXISTS "issue_tag" (
    "id" serial PRIMARY KEY NOT NULL,
    "created" timestamp with time zone DEFAULT Now() NOT NULL,
    "updated" timestamp with time zone DEFAULT Now() NOT NULL,
    "name" text NOT NULL,
    "icon" text DEFAULT '' NOT NULL,
    "colour_bg" text DEFAULT '#808080' NOT NULL,
    "colour_txt" text DEFAULT '#000000' NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues_tag" (
    "id" serial PRIMARY KEY NOT NULL,
    "issue_id" integer NOT NULL REFERENCES "issues"("id"),
    "tag_id" integer NOT NULL REFERENCES "issue_tag"("id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issues_tag_issue_id_idx" ON "issues_tag" ("issue_id");
