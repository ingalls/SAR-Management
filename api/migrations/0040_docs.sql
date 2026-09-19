CREATE TABLE IF NOT EXISTS "docs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "created" timestamp with time zone DEFAULT Now() NOT NULL,
    "updated" timestamp with time zone DEFAULT Now() NOT NULL,
    "uid" integer REFERENCES "users"("id"),
    "type" text DEFAULT 'file' NOT NULL,
    "path" text DEFAULT '/' NOT NULL,
    "name" text NOT NULL,
    "size" bigint DEFAULT 0 NOT NULL,
    "artifacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT "docs_type_check" CHECK ("type" IN ('file', 'dir')),
    CONSTRAINT "docs_path_check" CHECK ("path" ~ '^/(.*/)?$'),
    CONSTRAINT "docs_name_check" CHECK ("name" <> '' AND "name" !~ '/')
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "docs_path_name_idx" ON "docs" ("path", "name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "docs_path_idx" ON "docs" ("path");
