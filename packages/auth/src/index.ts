import { nextCookies } from 'better-auth/next-js';
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@banner-money/db";
import * as schema from "@banner-money/db/schema/auth";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3001"],
	socialProviders: {
		twitter: {
			clientId: process.env.X_CLIENT_ID as string,
			clientSecret: process.env.X_CLIENT_SECRET as string,
			redirectURI: process.env.X_REDIRECT_URI || "http://localhost:3001/api/auth/callback/twitter",
		},
	},
	plugins: [nextCookies()]
});
