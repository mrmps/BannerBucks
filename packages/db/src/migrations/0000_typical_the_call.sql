CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE "user" RENAME TO "users";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twitter_synced_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twitter_followers_count" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_creator_profile" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_sponsor_profile" boolean DEFAULT false NOT NULL;
CREATE TABLE IF NOT EXISTS "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"min_price_cents" integer,
	"max_price_cents" integer,
	"categories" jsonb,
	"looking_for" text,
	"contact_method" text,
	"contact_value" text,
	"headline" text,
	"bio" text,
	"audience_highlights" jsonb,
	"social_proof" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "sponsor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text,
	"company_website" text,
	"industry" text,
	"categories" jsonb,
	"budget_min_cents" integer,
	"budget_max_cents" integer,
	"looking_for" text,
	"about" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "stripe_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text,
	"customer_id" text,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"charges_enabled" boolean DEFAULT false NOT NULL,
	"details_submitted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "creator_profiles" ADD CONSTRAINT IF NOT EXISTS "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sponsor_profiles" ADD CONSTRAINT IF NOT EXISTS "sponsor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "stripe_data" ADD CONSTRAINT IF NOT EXISTS "stripe_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_user_id_idx" ON "creator_profiles" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "creator_profiles_status_idx" ON "creator_profiles" USING btree ("status");
CREATE INDEX IF NOT EXISTS "creator_profiles_categories_idx" ON "creator_profiles" USING btree ("categories");
CREATE UNIQUE INDEX IF NOT EXISTS "sponsor_profiles_user_id_idx" ON "sponsor_profiles" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "sponsor_profiles_industry_idx" ON "sponsor_profiles" USING btree ("industry");
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_data_user_id_idx" ON "stripe_data" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_data_account_id_idx" ON "stripe_data" USING btree ("account_id");