ALTER TABLE "missions" RENAME COLUMN "external_id" TO "externalid";--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "poll_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "server" ADD PRIMARY KEY ("key");--> statement-breakpoint
