import { db } from "@banner-money/db";
import {
  account,
  session,
  user,
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
      user,
      session,
      account,
      verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CORS_ORIGIN as string],
  socialProviders: {
    twitter: {
      clientId: process.env.X_CLIENT_ID as string,
      clientSecret: process.env.X_CLIENT_SECRET as string,
      redirectURI: process.env.X_REDIRECT_URI,
      disableDefaultScope: true,
      scope: ["tweet.read", "users.read", "offline.access"],
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
