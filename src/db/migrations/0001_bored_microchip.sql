CREATE TYPE "public"."activityType" AS ENUM('GROUP_MEMBER_ADDED', 'GROUP_MEMBER_REMOVED', 'EXPENSE_ADDED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED');--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" DROP CONSTRAINT "activity_group_id_group_id_fk";
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "activity_type" "activityType" NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "metadata" jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "activity";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "user_id";