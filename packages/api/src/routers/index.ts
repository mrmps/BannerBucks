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

      // Fetch Twitter user data using the access token - GET ALL AVAILABLE FIELDS!
      const twitterResponse = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=id,name,username,description,location,url,profile_image_url,profile_banner_url,created_at,public_metrics,verified,verified_type,verified_followers_count,subscription_type,entities",
        {
          headers: {
            Authorization: `Bearer ${twitterAccount.accessToken}`,
          },
        }
      );

      if (!twitterResponse.ok) {
        throw new Error("Failed to fetch Twitter data");
      }

      const twitterData = (await twitterResponse.json()) as {
        data: {
          id: string;
          name: string;
          username: string;
          description?: string;
          location?: string;
          url?: string;
          profile_image_url: string;
          profile_banner_url?: string;
          created_at?: string;
          verified?: boolean;
          verified_type?: string;
          verified_followers_count?: number;
          subscription_type?: string;
          public_metrics?: {
            followers_count: number;
            following_count: number;
            tweet_count: number;
            listed_count: number;
          };
          // biome-ignore lint/suspicious/noExplicitAny: Twitter API entities have dynamic structure
          entities?: any;
        };
      };
      const userData = twitterData.data;

      // Get higher quality profile image (remove _normal suffix for 400x400)
      const highQualityImage = userData.profile_image_url.replace(
        "_normal",
        "_400x400"
      );

      // Get high-quality banner URL (API v2 provides base URL, append size)
      const bannerUrl = userData.profile_banner_url
        ? `${userData.profile_banner_url}/1500x500`
        : null;

      // Update user in database with Twitter data
      await db
        .update(user)
        .set({
          name: userData.name,
          image: highQualityImage,
          twitterId: userData.id,
          twitterUsername: userData.username,
          twitterBio: userData.description || null,
          twitterLocation: userData.location || null,
          twitterUrl: userData.url || null,
          twitterBannerUrl: bannerUrl,
          twitterVerified: userData.verified,
          twitterVerifiedType: userData.verified_type || null,
          twitterCreatedAt: userData.created_at
            ? new Date(userData.created_at)
            : null,
          twitterFollowers: userData.public_metrics?.followers_count || 0,
          twitterFollowing: userData.public_metrics?.following_count || 0,
          twitterTweetCount: userData.public_metrics?.tweet_count || 0,
          twitterListedCount: userData.public_metrics?.listed_count || 0,
          twitterVerifiedFollowers: userData.verified_followers_count || 0,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return { success: true, user: userData };
    }),
  },
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
