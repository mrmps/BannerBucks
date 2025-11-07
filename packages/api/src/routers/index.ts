import {
  refreshTwitterAccessToken,
  syncTwitterProfile,
  TWITTER_UNAUTHORIZED_STATUS,
  TwitterSyncError,
  updateTwitterAccountTokens,
} from "@banner-money/auth/twitter-sync";
import { db, eq, isNotNull } from "@banner-money/db";
import { account, users } from "@banner-money/db/schema/auth";
import type { RouterClient } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
  users: {
    getAll: publicProcedure.handler(async () => {
      const userRows = await db
        .select({
          id: users.id,
          name: users.name,
          image: users.image,
          role: users.role,
          twitterId: users.twitter_id,
          twitterUsername: users.twitter_username,
          twitterBio: users.twitter_bio,
          twitterLocation: users.twitter_location,
          twitterUrl: users.twitter_url,
          twitterBannerUrl: users.twitter_banner_url,
          twitterVerified: users.twitter_verified,
          twitterVerifiedType: users.twitter_verified_type,
          twitterCreatedAt: users.twitter_created_at,
          twitterFollowers: users.twitter_followers,
          twitterFollowing: users.twitter_following,
          twitterTweetCount: users.twitter_tweet_count,
          twitterListedCount: users.twitter_listed_count,
          twitterVerifiedFollowers: users.twitter_verified_followers,
          creatorStatus: users.creator_status,
          creatorPriceMin: users.creator_price_min,
          creatorPriceMax: users.creator_price_max,
          creatorCategories: users.creator_categories,
          creatorLookingFor: users.creator_looking_for,
          creatorContactMethod: users.creator_contact_method,
          creatorContactValue: users.creator_contact_value,
          sponsorStatus: users.sponsor_status,
          sponsorCompanyName: users.sponsor_company_name,
          sponsorCompanyWebsite: users.sponsor_company_website,
          sponsorIndustry: users.sponsor_industry,
          sponsorCategories: users.sponsor_categories,
          sponsorBudgetMin: users.sponsor_budget_min,
          sponsorBudgetMax: users.sponsor_budget_max,
          sponsorLookingFor: users.sponsor_looking_for,
          createdAt: users.created_at,
        })
        .from(users)
        .where(isNotNull(users.twitter_id))
        .orderBy(users.twitter_followers);

      return userRows;
    }),
    setRole: protectedProcedure
      .input(
        z.object({
          role: z.enum(["creator", "sponsor", "both"]),
        })
      )
      .handler(async ({ context, input }) => {
        const userId = context.session.user.id;

        await db
          .update(users)
          .set({
            role: input.role,
            onboarding_completed: true,
          })
          .where(eq(users.id, userId));

        return { success: true, role: input.role };
      }),
    updateCreatorSettings: protectedProcedure
      .input(
        z.object({
          status: z.enum(["available", "unavailable", "hidden"]).optional(),
          priceMin: z.number().optional(),
          priceMax: z.number().optional(),
          categories: z.array(z.string()).optional(),
          lookingFor: z.string().optional(),
          contactMethod: z.enum(["twitter", "email", "other"]).optional(),
          contactValue: z.string().optional(),
        })
      )
      .handler(async ({ context, input }) => {
        const userId = context.session.user.id;

        await db
          .update(users)
          .set({
            creator_status: input.status,
            creator_price_min: input.priceMin,
            creator_price_max: input.priceMax,
            creator_categories: input.categories
              ? JSON.stringify(input.categories)
              : undefined,
            creator_looking_for: input.lookingFor,
            creator_contact_method: input.contactMethod,
            creator_contact_value: input.contactValue,
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true };
      }),
    updateSponsorSettings: protectedProcedure
      .input(
        z.object({
          status: z.enum(["active", "inactive", "hidden"]).optional(),
          companyName: z.string().optional(),
          companyWebsite: z.string().optional(),
          industry: z.string().optional(),
          categories: z.array(z.string()).optional(),
          budgetMin: z.number().optional(),
          budgetMax: z.number().optional(),
          lookingFor: z.string().optional(),
        })
      )
      .handler(async ({ context, input }) => {
        const userId = context.session.user.id;

        await db
          .update(users)
          .set({
            sponsor_status: input.status,
            sponsor_company_name: input.companyName,
            sponsor_company_website: input.companyWebsite,
            sponsor_industry: input.industry,
            sponsor_categories: input.categories
              ? JSON.stringify(input.categories)
              : undefined,
            sponsor_budget_min: input.budgetMin,
            sponsor_budget_max: input.budgetMax,
            sponsor_looking_for: input.lookingFor,
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true };
      }),
  },
  twitter: {
    sync: protectedProcedure.handler(async ({ context }) => {
      const userId = context.session.user.id;

      // Get user's Twitter account from the account table
      const accounts = await db
        .select({
          id: account.id,
          providerId: account.provider_id,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        })
        .from(account)
        .where(eq(account.user_id, userId));

      const twitterAccount = accounts.find(
        (acc) => acc.providerId === "twitter"
      );

      if (!twitterAccount?.accessToken) {
        throw new Error("Twitter account not connected");
      }

      try {
        const userData = await syncTwitterProfile({
          userId,
          accessToken: twitterAccount.accessToken,
        });

        return { success: true, user: userData };
      } catch (error) {
        if (error instanceof TwitterSyncError) {
          if (
            error.status === TWITTER_UNAUTHORIZED_STATUS &&
            twitterAccount.refreshToken
          ) {
            const clientId = process.env.X_CLIENT_ID;
            const clientSecret = process.env.X_CLIENT_SECRET;

            if (!clientId) {
              throw new Error(
                "Twitter authorization expired and automatic refresh is unavailable. Please reconnect your account."
              );
            }

            try {
              const refreshed = await refreshTwitterAccessToken({
                refreshToken: twitterAccount.refreshToken,
                clientId,
                clientSecret,
              });

              await updateTwitterAccountTokens({
                accountId: twitterAccount.id,
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token,
                expiresIn: refreshed.expires_in,
              });

              const userData = await syncTwitterProfile({
                userId,
                accessToken: refreshed.access_token,
              });

              return { success: true, user: userData };
            } catch (_refreshError) {
              throw new Error(
                "Twitter authorization expired and could not be refreshed automatically. Please reconnect your account."
              );
            }
          }

          throw new Error(
            `Twitter sync failed (status ${error.status ?? "unknown"}).`
          );
        }

        throw error;
      }
    }),
  },
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
