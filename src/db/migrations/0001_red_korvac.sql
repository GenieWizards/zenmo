ALTER TYPE "public"."activityType" ADD VALUE 'group_created' BEFORE 'group_member_added';--> statement-breakpoint
ALTER TYPE "public"."activityType" ADD VALUE 'group_deleted' BEFORE 'group_member_added';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_index" ON "category" USING gin ((
      setweight(to_tsvector('english', "name"), 'A') ||
          setweight(to_tsvector('english', "description"), 'B')
    ));