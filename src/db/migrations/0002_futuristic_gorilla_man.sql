ALTER TABLE "public"."activity" ALTER COLUMN "activity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activityType";--> statement-breakpoint
CREATE TYPE "public"."activityType" AS ENUM('category_created', 'group_member_added', 'group_member_removed', 'expense_added', 'expense_updated', 'expense_deleted');--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "activity_type" SET DATA TYPE "public"."activityType" USING "activity_type"::"public"."activityType";