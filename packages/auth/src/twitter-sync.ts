import { Buffer } from "node:buffer";

import { db, eq } from "@banner-money/db";
import { account, users } from "@banner-money/db/schema/auth";

export class TwitterSyncError extends Error {
  status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "TwitterSyncError";
    this.status = options?.status;
  }
}

export class TwitterTokenRefreshError extends Error {
  status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = "TwitterTokenRefreshError";
    this.status = options?.status;
  }
}

export const TWITTER_UNAUTHORIZED_STATUS = 401;
const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_PROFILE_IMAGE_NORMAL_SUFFIX = "_normal";
const TWITTER_PROFILE_IMAGE_HIGH_RES_SUFFIX = "_400x400";
const TWITTER_PROFILE_BANNER_DIMENSIONS = "1500x500";
const MILLISECONDS_PER_SECOND = 1000;

const TWITTER_USER_FIELDS =
  "id,name,username,description,location,url,profile_image_url,profile_banner_url,created_at,public_metrics,verified,verified_type,verified_followers_count,subscription_type,entities";

type TwitterPublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

export type TwitterUserData = {
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
  public_metrics?: TwitterPublicMetrics;
  // biome-ignore lint/suspicious/noExplicitAny: Twitter API entities have dynamic structure
  entities?: any;
};

type TwitterUserResponse = {
  data: TwitterUserData;
};

export async function syncTwitterProfile({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}): Promise<TwitterUserData> {
  const twitterResponse = await fetch(
    `https://api.twitter.com/2/users/me?user.fields=${TWITTER_USER_FIELDS}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (twitterResponse.status === TWITTER_UNAUTHORIZED_STATUS) {
    throw new TwitterSyncError("Twitter authorization expired", {
      status: twitterResponse.status,
    });
  }

  if (!twitterResponse.ok) {
    throw new TwitterSyncError(
      `Failed to fetch Twitter data: ${twitterResponse.status} ${twitterResponse.statusText}`,
      { status: twitterResponse.status }
    );
  }

  const twitterData = (await twitterResponse.json()) as TwitterUserResponse;
  const userData = twitterData.data;

  const highQualityImage = userData.profile_image_url
    ? userData.profile_image_url.replace(
        TWITTER_PROFILE_IMAGE_NORMAL_SUFFIX,
        TWITTER_PROFILE_IMAGE_HIGH_RES_SUFFIX
      )
    : null;

  const bannerUrl = userData.profile_banner_url
    ? `${userData.profile_banner_url}/${TWITTER_PROFILE_BANNER_DIMENSIONS}`
    : null;

  await db
    .update(users)
    .set({
      name: userData.name,
      image: highQualityImage ?? null,
      avatar_url: highQualityImage ?? null,
      twitter_id: userData.id,
      twitter_username: userData.username,
      twitter_bio: userData.description ?? null,
      twitter_location: userData.location ?? null,
      twitter_url: userData.url ?? null,
      twitter_banner_url: bannerUrl,
      twitter_verified: userData.verified ?? false,
      twitter_verified_type: userData.verified_type ?? null,
      twitter_created_at: userData.created_at
        ? new Date(userData.created_at)
        : null,
      twitter_followers: userData.public_metrics?.followers_count ?? 0,
      twitter_following: userData.public_metrics?.following_count ?? 0,
      twitter_tweet_count: userData.public_metrics?.tweet_count ?? 0,
      twitter_listed_count: userData.public_metrics?.listed_count ?? 0,
      twitter_verified_followers: userData.verified_followers_count ?? 0,
      twitter_followers_count: userData.public_metrics?.followers_count ?? 0,
      twitter_synced_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));

  return userData;
}

type TwitterTokenResponse = {
  token_type?: string;
  expires_in?: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
};

export async function refreshTwitterAccessToken({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string;
  clientId: string;
  clientSecret?: string;
}): Promise<TwitterTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    headers.Authorization = `Basic ${credentials}`;
  }

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers,
    body: params.toString(),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok) {
    throw new TwitterTokenRefreshError(
      payload.error_description ||
        `Failed to refresh Twitter access token: ${response.status} ${response.statusText}`,
      { status: response.status }
    );
  }

  if (!payload.access_token) {
    throw new TwitterTokenRefreshError(
      payload.error_description ||
        "Twitter token refresh succeeded but did not include an access token"
    );
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token ?? refreshToken,
    expires_in: payload.expires_in,
    token_type: payload.token_type,
    scope: payload.scope,
  };
}

export async function updateTwitterAccountTokens({
  accountId,
  accessToken,
  refreshToken,
  expiresIn,
}: {
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  await db
    .update(account)
    .set({
      access_token: accessToken,
      refresh_token: refreshToken ?? null,
      access_token_expires_at: expiresIn
        ? new Date(Date.now() + expiresIn * MILLISECONDS_PER_SECOND)
        : null,
      updated_at: new Date(),
    })
    .where(eq(account.id, accountId));
}
