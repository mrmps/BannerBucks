import { db } from "@banner-money/db";
import {
  account,
  session,
  users,
  verification,
} from "@banner-money/db/schema/auth";
import { logger } from "@banner-money/logger";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  refreshTwitterAccessToken,
  syncTwitterProfile,
  TwitterSyncError,
  updateTwitterAccountTokens,
} from "./twitter-sync";

type TwitterOAuthProfile = {
  id?: string;
  name?: string;
  username?: string;
  description?: string;
  location?: string;
  url?: string;
  profile_image_url?: string;
  profile_banner_url?: string;
  created_at?: string;
  verified?: boolean;
  verified_type?: string;
  verified_followers_count?: number;
  public_metrics?: {
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
    listed_count?: number;
  };
};

function mapTwitterProfileToUser(profile: unknown) {
  const data =
    (profile as { data?: TwitterOAuthProfile })?.data ??
    (profile as TwitterOAuthProfile);

  if (!data) {
    return {
      twitterSyncedAt: new Date(),
    };
  }

  const followersCount = data.public_metrics?.followers_count;
  return {
    name: data.name ?? undefined,
    image: data.profile_image_url ?? undefined,
    twitterId: data.id ?? undefined,
    twitterUsername: data.username ?? undefined,
    twitterBio: data.description ?? undefined,
    twitterLocation: data.location ?? undefined,
    twitterUrl: data.url ?? undefined,
    twitterBannerUrl: data.profile_banner_url ?? undefined,
    twitterVerified: data.verified ?? undefined,
    twitterVerifiedType: data.verified_type ?? undefined,
    twitterCreatedAt: data.created_at ? new Date(data.created_at) : undefined,
    twitterFollowersCount: followersCount ?? undefined,
    avatarUrl: data.profile_image_url ?? undefined,
    twitterFollowers: data.public_metrics?.followers_count ?? undefined,
    twitterFollowing: data.public_metrics?.following_count ?? undefined,
    twitterTweetCount: data.public_metrics?.tweet_count ?? undefined,
    twitterListedCount: data.public_metrics?.listed_count ?? undefined,
    twitterVerifiedFollowers: data.verified_followers_count ?? undefined,
    twitterSyncedAt: new Date(),
  };
}

const TWITTER_UNAUTHORIZED_STATUS = 401;

async function syncTwitterFromAccount(accountRecord: {
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  userId: string;
  id: string;
}) {
  if (accountRecord.providerId !== "twitter" || !accountRecord.accessToken) {
    return;
  }

  try {
    await syncTwitterProfile({
      userId: accountRecord.userId,
      accessToken: accountRecord.accessToken,
    });
  } catch (error) {
    const status = error instanceof TwitterSyncError ? error.status : undefined;

    if (
      error instanceof TwitterSyncError &&
      status === TWITTER_UNAUTHORIZED_STATUS &&
      accountRecord.refreshToken
    ) {
      const clientId = process.env.X_CLIENT_ID;
      const clientSecret = process.env.X_CLIENT_SECRET;

      if (clientId) {
        try {
          const refreshed = await refreshTwitterAccessToken({
            refreshToken: accountRecord.refreshToken,
            clientId,
            clientSecret,
          });

          await updateTwitterAccountTokens({
            accountId: accountRecord.id,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresIn: refreshed.expires_in,
          });

          await syncTwitterProfile({
            userId: accountRecord.userId,
            accessToken: refreshed.access_token,
          });

          logger.info(
            { userId: accountRecord.userId },
            "Twitter token refreshed successfully during automatic sync"
          );
          return;
        } catch (refreshError) {
          logger.warn(
            { refreshError, userId: accountRecord.userId },
            "Failed to refresh Twitter token during automatic sync"
          );
        }
      } else {
        logger.warn(
          { userId: accountRecord.userId },
          "Cannot refresh Twitter token: missing X_CLIENT_ID"
        );
      }
    }

    logger.warn(
      { error, userId: accountRecord.userId, status },
      status === TWITTER_UNAUTHORIZED_STATUS
        ? "Twitter token expired during automatic sync"
        : "Failed to sync Twitter profile after auth hook"
    );
  }
}

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session,
      account,
      verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CORS_ORIGIN as string],
  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      twitterId: {
        type: "string",
        fieldName: "twitter_id",
        required: false,
        input: false,
      },
      twitterUsername: {
        type: "string",
        fieldName: "twitter_username",
        required: false,
        input: false,
      },
      twitterBio: {
        type: "string",
        fieldName: "twitter_bio",
        required: false,
        input: false,
      },
      twitterLocation: {
        type: "string",
        fieldName: "twitter_location",
        required: false,
        input: false,
      },
      twitterBannerUrl: {
        type: "string",
        fieldName: "twitter_banner_url",
        required: false,
        input: false,
      },
      twitterUrl: {
        type: "string",
        fieldName: "twitter_url",
        required: false,
        input: false,
      },
      twitterVerified: {
        type: "boolean",
        fieldName: "twitter_verified",
        required: false,
        defaultValue: false,
        input: false,
      },
      twitterVerifiedType: {
        type: "string",
        fieldName: "twitter_verified_type",
        required: false,
        input: false,
      },
      twitterCreatedAt: {
        type: "date",
        fieldName: "twitter_created_at",
        required: false,
        input: false,
      },
      twitterFollowers: {
        type: "number",
        fieldName: "twitter_followers",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterFollowing: {
        type: "number",
        fieldName: "twitter_following",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterTweetCount: {
        type: "number",
        fieldName: "twitter_tweet_count",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterListedCount: {
        type: "number",
        fieldName: "twitter_listed_count",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterVerifiedFollowers: {
        type: "number",
        fieldName: "twitter_verified_followers",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterFollowersCount: {
        type: "number",
        fieldName: "twitter_followers_count",
        required: false,
        defaultValue: 0,
        input: false,
      },
      twitterSyncedAt: {
        type: "date",
        fieldName: "twitter_synced_at",
        required: false,
        input: false,
      },
      avatarUrl: {
        type: "string",
        fieldName: "avatar_url",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        fieldName: "role",
        required: false,
      },
      onboardingCompleted: {
        type: "boolean",
        fieldName: "onboarding_completed",
        required: false,
        defaultValue: false,
      },
      creatorStatus: {
        type: "string",
        fieldName: "creator_status",
        required: false,
      },
      creatorPriceMin: {
        type: "number",
        fieldName: "creator_price_min",
        required: false,
      },
      creatorPriceMax: {
        type: "number",
        fieldName: "creator_price_max",
        required: false,
      },
      creatorCategories: {
        type: "string",
        fieldName: "creator_categories",
        required: false,
      },
      creatorLookingFor: {
        type: "string",
        fieldName: "creator_looking_for",
        required: false,
      },
      creatorContactMethod: {
        type: "string",
        fieldName: "creator_contact_method",
        required: false,
      },
      creatorContactValue: {
        type: "string",
        fieldName: "creator_contact_value",
        required: false,
      },
      sponsorStatus: {
        type: "string",
        fieldName: "sponsor_status",
        required: false,
      },
      sponsorCompanyName: {
        type: "string",
        fieldName: "sponsor_company_name",
        required: false,
      },
      sponsorCompanyWebsite: {
        type: "string",
        fieldName: "sponsor_company_website",
        required: false,
      },
      sponsorIndustry: {
        type: "string",
        fieldName: "sponsor_industry",
        required: false,
      },
      sponsorCategories: {
        type: "string",
        fieldName: "sponsor_categories",
        required: false,
      },
      sponsorBudgetMin: {
        type: "number",
        fieldName: "sponsor_budget_min",
        required: false,
      },
      sponsorBudgetMax: {
        type: "number",
        fieldName: "sponsor_budget_max",
        required: false,
      },
      sponsorLookingFor: {
        type: "string",
        fieldName: "sponsor_looking_for",
        required: false,
      },
      hasCreatorProfile: {
        type: "boolean",
        fieldName: "has_creator_profile",
        required: false,
        defaultValue: false,
        input: false,
      },
      hasSponsorProfile: {
        type: "boolean",
        fieldName: "has_sponsor_profile",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    modelName: "account",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  socialProviders: {
    twitter: {
      clientId: process.env.X_CLIENT_ID as string,
      clientSecret: process.env.X_CLIENT_SECRET as string,
      redirectURI: process.env.X_REDIRECT_URI,
      disableDefaultScope: true,
      scope: ["tweet.read", "users.read", "offline.access"],
      mapProfileToUser: mapTwitterProfileToUser,
    },
  },
  plugins: [nextCookies()],
  logger: {
    level: "debug",
    disabled: false,
  },
  advanced: {
    generateId: undefined,
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
    },
  },
  onAPIError: {
    onError: (error) => {
      const err = error as unknown;
      logger.error(
        {
          err,
          message: (err as Error)?.message || "Unknown error",
          // biome-ignore lint/suspicious/noExplicitAny: Better Auth error objects have non-standard properties
          status: (err as any)?.status,
          // biome-ignore lint/suspicious/noExplicitAny: Better Auth error objects have non-standard properties
          code: (err as any)?.code || (err as Error)?.name,
          // biome-ignore lint/suspicious/noExplicitAny: Better Auth error objects have non-standard properties
          body: (err as any)?.body,
          stack: (err as Error)?.stack,
        },
        "Better Auth API Error"
      );
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (accountRecord) => {
          await syncTwitterFromAccount(accountRecord);
        },
      },
      update: {
        after: async (accountRecord) => {
          await syncTwitterFromAccount(accountRecord);
        },
      },
    },
  },
} satisfies BetterAuthOptions);
