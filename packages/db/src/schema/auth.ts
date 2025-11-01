import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	
	// Twitter data
	twitterId: text("twitter_id").unique(),
	twitterUsername: text("twitter_username"),
	twitterBio: text("twitter_bio"),
	twitterLocation: text("twitter_location"),
	twitterBannerUrl: text("twitter_banner_url"),
	twitterUrl: text("twitter_url"),
	twitterVerified: boolean("twitter_verified").default(false),
	twitterVerifiedType: text("twitter_verified_type"),
	twitterCreatedAt: timestamp("twitter_created_at"),
	
	// Public metrics
	twitterFollowers: integer("twitter_followers").default(0),
	twitterFollowing: integer("twitter_following").default(0),
	twitterTweetCount: integer("twitter_tweet_count").default(0),
	twitterListedCount: integer("twitter_listed_count").default(0),
	twitterVerifiedFollowers: integer("twitter_verified_followers").default(0),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
