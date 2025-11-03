import {
  refreshTwitterAccessToken,
  syncTwitterProfile,
  TWITTER_UNAUTHORIZED_STATUS,
  TwitterSyncError,
  updateTwitterAccountTokens,
} from "@banner-money/auth/twitter-sync";
import { db } from "@banner-money/db";
import { account, user } from "@banner-money/db/schema/auth";
import type { RouterClient } from "@orpc/server";
import { eq, isNotNull } from "drizzle-orm";
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
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
          twitterId: user.twitterId,
          twitterUsername: user.twitterUsername,
          twitterBio: user.twitterBio,
          twitterLocation: user.twitterLocation,
          twitterUrl: user.twitterUrl,
          twitterBannerUrl: user.twitterBannerUrl,
          twitterVerified: user.twitterVerified,
          twitterVerifiedType: user.twitterVerifiedType,
          twitterCreatedAt: user.twitterCreatedAt,
          twitterFollowers: user.twitterFollowers,
          twitterFollowing: user.twitterFollowing,
          twitterTweetCount: user.twitterTweetCount,
          twitterListedCount: user.twitterListedCount,
          twitterVerifiedFollowers: user.twitterVerifiedFollowers,
          creatorStatus: user.creatorStatus,
          creatorPriceMin: user.creatorPriceMin,
          creatorPriceMax: user.creatorPriceMax,
          creatorCategories: user.creatorCategories,
          creatorLookingFor: user.creatorLookingFor,
          creatorContactMethod: user.creatorContactMethod,
          creatorContactValue: user.creatorContactValue,
          sponsorStatus: user.sponsorStatus,
          sponsorCompanyName: user.sponsorCompanyName,
          sponsorCompanyWebsite: user.sponsorCompanyWebsite,
          sponsorIndustry: user.sponsorIndustry,
          sponsorCategories: user.sponsorCategories,
          sponsorBudgetMin: user.sponsorBudgetMin,
          sponsorBudgetMax: user.sponsorBudgetMax,
          sponsorLookingFor: user.sponsorLookingFor,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(isNotNull(user.twitterId))
        .orderBy(user.twitterFollowers);

      return users;
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
          .update(user)
          .set({
            role: input.role,
            onboardingCompleted: true,
          })
          .where(eq(user.id, userId));

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
          .update(user)
          .set({
            creatorStatus: input.status,
            creatorPriceMin: input.priceMin,
            creatorPriceMax: input.priceMax,
            creatorCategories: input.categories
              ? JSON.stringify(input.categories)
              : undefined,
            creatorLookingFor: input.lookingFor,
            creatorContactMethod: input.contactMethod,
            creatorContactValue: input.contactValue,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));

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
          .update(user)
          .set({
            sponsorStatus: input.status,
            sponsorCompanyName: input.companyName,
            sponsorCompanyWebsite: input.companyWebsite,
            sponsorIndustry: input.industry,
            sponsorCategories: input.categories
              ? JSON.stringify(input.categories)
              : undefined,
            sponsorBudgetMin: input.budgetMin,
            sponsorBudgetMax: input.budgetMax,
            sponsorLookingFor: input.lookingFor,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));

        return { success: true };
      }),
  },
  twitter: {
    sync: protectedProcedure.handler(async ({ context }) => {
      const userId = context.session.user.id;

      // Get user's Twitter account from the account table
      const accounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId));

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
