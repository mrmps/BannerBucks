import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const creatorProfiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    minPriceCents: integer("min_price_cents"),
    maxPriceCents: integer("max_price_cents"),
    categories: jsonb("categories"),
    lookingFor: text("looking_for"),
    contactMethod: text("contact_method"),
    contactValue: text("contact_value"),
    headline: text("headline"),
    bio: text("bio"),
    audienceHighlights: jsonb("audience_highlights"),
    socialProof: jsonb("social_proof"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    creatorProfilesUserIdIdx: uniqueIndex("creator_profiles_user_id_idx").on(
      table.userId
    ),
    creatorProfilesStatusIdx: index("creator_profiles_status_idx").on(
      table.status
    ),
    creatorProfilesCategoriesIdx: index("creator_profiles_categories_idx").on(
      table.categories
    ),
  })
);

export const sponsorProfiles = pgTable(
  "sponsor_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: text("company_name"),
    companyWebsite: text("company_website"),
    industry: text("industry"),
    categories: jsonb("categories"),
    budgetMinCents: integer("budget_min_cents"),
    budgetMaxCents: integer("budget_max_cents"),
    lookingFor: text("looking_for"),
    about: text("about"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sponsorProfilesUserIdIdx: uniqueIndex("sponsor_profiles_user_id_idx").on(
      table.userId
    ),
    sponsorProfilesIndustryIdx: index("sponsor_profiles_industry_idx").on(
      table.industry
    ),
  })
);

export const stripeData = pgTable(
  "stripe_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id"),
    customerId: text("customer_id"),
    payoutsEnabled: boolean("payouts_enabled").notNull().default(false),
    chargesEnabled: boolean("charges_enabled").notNull().default(false),
    detailsSubmitted: boolean("details_submitted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    stripeDataUserIdIdx: uniqueIndex("stripe_data_user_id_idx").on(
      table.userId
    ),
    stripeDataAccountIdIdx: uniqueIndex("stripe_data_account_id_idx").on(
      table.accountId
    ),
  })
);
