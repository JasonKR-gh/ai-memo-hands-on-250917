ALTER TABLE "notes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "deleted_by" uuid;