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
} satisfies BetterAuthOptions);
