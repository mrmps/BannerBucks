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
          twitterId: users.twitterId,
          twitterUsername: users.twitterUsername,
          twitterBio: users.twitterBio,
          twitterLocation: users.twitterLocation,
          twitterUrl: users.twitterUrl,
          twitterBannerUrl: users.twitterBannerUrl,
          twitterVerified: users.twitterVerified,
          twitterVerifiedType: users.twitterVerifiedType,
          twitterCreatedAt: users.twitterCreatedAt,
          twitterFollowers: users.twitterFollowers,
          twitterFollowing: users.twitterFollowing,
          twitterTweetCount: users.twitterTweetCount,
          twitterListedCount: users.twitterListedCount,
          twitterVerifiedFollowers: users.twitterVerifiedFollowers,
          creatorStatus: users.creatorStatus,
          creatorPriceMin: users.creatorPriceMin,
          creatorPriceMax: users.creatorPriceMax,
          creatorCategories: users.creatorCategories,
          creatorLookingFor: users.creatorLookingFor,
          creatorContactMethod: users.creatorContactMethod,
          creatorContactValue: users.creatorContactValue,
          sponsorStatus: users.sponsorStatus,
          sponsorCompanyName: users.sponsorCompanyName,
          sponsorCompanyWebsite: users.sponsorCompanyWebsite,
          sponsorIndustry: users.sponsorIndustry,
          sponsorCategories: users.sponsorCategories,
          sponsorBudgetMin: users.sponsorBudgetMin,
          sponsorBudgetMax: users.sponsorBudgetMax,
          sponsorLookingFor: users.sponsorLookingFor,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(isNotNull(users.twitterId))
        .orderBy(users.twitterFollowers);

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
            onboardingCompleted: true,
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
          .where(eq(users.id, userId));

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
