ALTER TABLE "rolodex" ADD COLUMN "type" text DEFAULT 'person' NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "title" text DEFAULT '' NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "organization" text DEFAULT '' NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "website" text DEFAULT '' NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "address" text DEFAULT '' NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "tags" json DEFAULT '[]'::json NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "photo" boolean DEFAULT false NOT NULL;
ALTER TABLE "rolodex" ADD COLUMN "author" integer;
ALTER TABLE "rolodex" ADD CONSTRAINT "rolodex_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE TABLE "rolodex_to_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"rolodex_id" integer NOT NULL,
	"agency_id" bigint NOT NULL
);

ALTER TABLE "rolodex_to_agencies" ADD CONSTRAINT "rolodex_to_agencies_rolodex_id_rolodex_id_fk" FOREIGN KEY ("rolodex_id") REFERENCES "public"."rolodex"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "rolodex_to_agencies" ADD CONSTRAINT "rolodex_to_agencies_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "rolodex_to_agencies_unique" ON "rolodex_to_agencies" ("rolodex_id", "agency_id");

-- Carry the legacy single agency association into the new sharing table
INSERT INTO "rolodex_to_agencies" ("rolodex_id", "agency_id")
    SELECT "id", "agency_id" FROM "rolodex" WHERE "agency_id" IS NOT NULL;
