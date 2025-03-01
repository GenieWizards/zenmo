CREATE TYPE "public"."activityType" AS ENUM('category_created', 'category_updated', 'category_deleted', 'group_created', 'group_deleted', 'group_updated', 'group_member_added', 'group_member_removed', 'expense_added', 'expense_updated', 'expense_deleted');--> statement-breakpoint
CREATE TYPE "public"."splitType" AS ENUM('even', 'uneven', 'proportional');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('settled', 'unsettled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"user_id" varchar(60) NOT NULL,
	"access_token" varchar(255),
	"refresh_token" varchar(255),
	"id_token" varchar(255),
	"expires_at" timestamp,
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_userId_providerId_unique" UNIQUE("user_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"type" varchar(60) NOT NULL,
	"metadata" jsonb NOT NULL,
	"group_id" varchar(60),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"user_id" varchar(60),
	"is_active" boolean DEFAULT true NOT NULL,
	"icon" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"payer_id" varchar(60) NOT NULL,
	"creator_id" varchar(60) NOT NULL,
	"category_id" varchar(60),
	"group_id" varchar(60),
	"amount" real NOT NULL,
	"currency" varchar(3) NOT NULL,
	"split_type" "splitType",
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"creator_id" varchar(60) NOT NULL,
	"status" "status" DEFAULT 'unsettled',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(255),
	"user_agent" varchar(255),
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "split" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"user_id" varchar(60) NOT NULL,
	"expense_id" varchar(60) NOT NULL,
	"amount" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"full_name" varchar(255),
	"role" "role" DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "settlement" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"sender_id" varchar(60) NOT NULL,
	"receiver_id" varchar(60) NOT NULL,
	"group_id" varchar(60),
	"amount" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_groups" (
	"user_id" varchar(60) NOT NULL,
	"group_id" varchar(60) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "split" ADD CONSTRAINT "split_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "split" ADD CONSTRAINT "split_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users_to_groups" ADD CONSTRAINT "users_to_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_groups" ADD CONSTRAINT "users_to_groups_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_name_userId_idx" ON "category" USING btree (lower("name"),"user_id");--> statement-breakpoint
CREATE INDEX "search_index" ON "category" USING gin ((
      setweight(to_tsvector('english', "name"), 'A') ||
          setweight(to_tsvector('english', "description"), 'B')
    ));--> statement-breakpoint
CREATE UNIQUE INDEX "unique_email_idx" ON "users" USING btree (lower("email"));