import "dotenv/config";

import { db } from "@banner-money/db";
import { users } from "@banner-money/db/schema/auth";
import {
  creatorProfiles,
  sponsorProfiles,
} from "@banner-money/db/schema/marketplace";
import { eq, sql } from "drizzle-orm";

type LegacyUserRow = Record<string, unknown>;

function parseJSON<T>(value: unknown): T | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON value", { value, error });
    return undefined;
  }
}

async function migrateUser(userRow: LegacyUserRow) {
  const id = userRow.id as string | undefined;
  if (!id) {
    console.warn("Encountered legacy user row without id", userRow);
    return;
  }

  const legacyRole = userRow.role as string | null;
  const isCreator = legacyRole === "creator" || legacyRole === "both";
  const isSponsor = legacyRole === "sponsor" || legacyRole === "both";

  const creatorCategories = parseJSON<string[]>(
    userRow.creator_categories
  );
  const sponsorCategories = parseJSON<string[]>(
    userRow.sponsor_categories
  );

  await db
    .update(users)
    .set({
      twitterFollowersCount: (userRow.twitter_followers as number | null) ?? 0,
      hasCreatorProfile: isCreator,
      hasSponsorProfile: isSponsor,
    })
    .where(eq(users.id, id));

  if (isCreator && userRow.onboarding_completed) {
    await db
      .insert(creatorProfiles)
      .values({
        userId: id,
        status:
          (userRow.creator_status as string | null) === "available"
            ? "active"
            : "draft",
        minPriceCents: userRow.creator_price_min as number | null,
        maxPriceCents: userRow.creator_price_max as number | null,
        categories: creatorCategories,
        lookingFor: userRow.creator_looking_for as string | null,
        contactMethod: userRow.creator_contact_method as string | null,
        contactValue: userRow.creator_contact_value as string | null,
        headline: null,
        bio: null,
        audienceHighlights: null,
        socialProof: null,
      })
      .onConflictDoNothing({
        target: creatorProfiles.userId,
      });
  }

  if (isSponsor) {
    await db
      .insert(sponsorProfiles)
      .values({
        userId: id,
        companyName: userRow.sponsor_company_name as string | null,
        companyWebsite: userRow.sponsor_company_website as string | null,
        industry: userRow.sponsor_industry as string | null,
        categories: sponsorCategories,
        budgetMinCents: userRow.sponsor_budget_min as number | null,
        budgetMaxCents: userRow.sponsor_budget_max as number | null,
        lookingFor: userRow.sponsor_looking_for as string | null,
        about: null,
      })
      .onConflictDoNothing({
        target: sponsorProfiles.userId,
      });
  }
}

async function runMigration() {
  console.log("Starting data migration from legacy user columns...");

  const legacyUsers = await db.execute<LegacyUserRow>(
    sql`SELECT * FROM "users"`
  );

  let processed = 0;
  let failures = 0;

  for (const row of legacyUsers) {
    try {
      await migrateUser(row);
      processed += 1;
      if (processed % 25 === 0) {
        console.log(`Processed ${processed} users...`);
      }
    } catch (error) {
      failures += 1;
      console.error(`Failed to migrate user ${(row.id as string) ?? "<unknown>"}`, error);
    }
  }

  console.log(
    `Data migration finished. Processed ${processed} users with ${failures} failures.`
  );

  if (failures > 0) {
    process.exitCode = 1;
  }
}

runMigration().catch((error) => {
  console.error("Migration script failed", error);
  process.exitCode = 1;
});

