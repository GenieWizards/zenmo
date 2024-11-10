ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_providerId_unique" UNIQUE("user_id","provider_id");