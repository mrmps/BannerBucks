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
