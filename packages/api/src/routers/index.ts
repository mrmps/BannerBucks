import { protectedProcedure, publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import { db } from "@banner-money/db";
import * as schema from "@banner-money/db/schema/auth";
import { isNotNull, eq } from "drizzle-orm";
import { z } from "zod";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	users: {
		getAll: publicProcedure.handler(async () => {
			const users = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					image: schema.user.image,
					role: schema.user.role,
					twitterId: schema.user.twitterId,
					twitterUsername: schema.user.twitterUsername,
					twitterBio: schema.user.twitterBio,
					twitterLocation: schema.user.twitterLocation,
					twitterUrl: schema.user.twitterUrl,
					twitterBannerUrl: schema.user.twitterBannerUrl,
					twitterVerified: schema.user.twitterVerified,
					twitterVerifiedType: schema.user.twitterVerifiedType,
					twitterCreatedAt: schema.user.twitterCreatedAt,
					twitterFollowers: schema.user.twitterFollowers,
					twitterFollowing: schema.user.twitterFollowing,
					twitterTweetCount: schema.user.twitterTweetCount,
					twitterListedCount: schema.user.twitterListedCount,
					twitterVerifiedFollowers: schema.user.twitterVerifiedFollowers,
					creatorStatus: schema.user.creatorStatus,
					creatorPriceMin: schema.user.creatorPriceMin,
					creatorPriceMax: schema.user.creatorPriceMax,
					creatorCategories: schema.user.creatorCategories,
					creatorLookingFor: schema.user.creatorLookingFor,
					creatorContactMethod: schema.user.creatorContactMethod,
					creatorContactValue: schema.user.creatorContactValue,
					sponsorStatus: schema.user.sponsorStatus,
					sponsorCompanyName: schema.user.sponsorCompanyName,
					sponsorCompanyWebsite: schema.user.sponsorCompanyWebsite,
					sponsorIndustry: schema.user.sponsorIndustry,
					sponsorCategories: schema.user.sponsorCategories,
					sponsorBudgetMin: schema.user.sponsorBudgetMin,
					sponsorBudgetMax: schema.user.sponsorBudgetMax,
					sponsorLookingFor: schema.user.sponsorLookingFor,
					createdAt: schema.user.createdAt,
				})
				.from(schema.user)
				.where(isNotNull(schema.user.twitterId))
				.orderBy(schema.user.twitterFollowers);

			return users;
		}),
		setRole: protectedProcedure
			.input(
				z.object({
					role: z.enum(["creator", "sponsor", "both"]),
				}),
			)
			.handler(async ({ context, input }) => {
				const userId = context.session.user.id;

				await db
					.update(schema.user)
					.set({
						role: input.role,
						onboardingCompleted: true,
					})
					.where(eq(schema.user.id, userId));

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
				}),
			)
			.handler(async ({ context, input }) => {
				const userId = context.session.user.id;

				await db
					.update(schema.user)
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
					.where(eq(schema.user.id, userId));

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
				}),
			)
			.handler(async ({ context, input }) => {
				const userId = context.session.user.id;

				await db
					.update(schema.user)
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
					.where(eq(schema.user.id, userId));

				return { success: true };
			}),
	},
	twitter: {
		sync: protectedProcedure.handler(async ({ context }) => {
			const userId = context.session.user.id;

			// Get user's Twitter account from the account table
			const accounts = await db
				.select()
				.from(schema.account)
				.where(eq(schema.account.userId, userId));

			const twitterAccount = accounts.find((acc: typeof accounts[0]) => acc.providerId === "twitter");

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
				},
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
					entities?: any;
				};
			};
			const userData = twitterData.data;

			// Get higher quality profile image (remove _normal suffix for 400x400)
			const highQualityImage = userData.profile_image_url.replace(
				"_normal",
				"_400x400",
			);

			// Get high-quality banner URL (API v2 provides base URL, append size)
			const bannerUrl = userData.profile_banner_url
				? `${userData.profile_banner_url}/1500x500`
				: null;

			// Update user in database with Twitter data
			await db
				.update(schema.user)
				.set({
					name: userData.name,
					image: highQualityImage,
					twitterId: userData.id,
					twitterUsername: userData.username,
					twitterBio: userData.description || null,
					twitterLocation: userData.location || null,
					twitterUrl: userData.url || null,
					twitterBannerUrl: bannerUrl,
					twitterVerified: userData.verified || false,
					twitterVerifiedType: userData.verified_type || null,
					twitterCreatedAt: userData.created_at ? new Date(userData.created_at) : null,
					twitterFollowers: userData.public_metrics?.followers_count || 0,
					twitterFollowing: userData.public_metrics?.following_count || 0,
					twitterTweetCount: userData.public_metrics?.tweet_count || 0,
					twitterListedCount: userData.public_metrics?.listed_count || 0,
					twitterVerifiedFollowers: userData.verified_followers_count || 0,
					updatedAt: new Date(),
				})
				.where(eq(schema.user.id, userId));

			return { success: true, user: userData };
		}),
	},
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
