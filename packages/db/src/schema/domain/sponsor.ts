import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "../auth";

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
