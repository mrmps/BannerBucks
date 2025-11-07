import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "../auth";

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
