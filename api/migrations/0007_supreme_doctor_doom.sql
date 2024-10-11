CREATE TABLE IF NOT EXISTS "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT Now() NOT NULL,
	"updated" timestamp with time zone DEFAULT Now() NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"protected" boolean DEFAULT false NOT NULL,
	"name" text,
	"location_geom" "GEOMETRY(POINT, 4326)",
	"remarks" text NOT NULL
);
