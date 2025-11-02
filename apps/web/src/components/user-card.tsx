import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Number formatting constants
const MILLION_THRESHOLD = 1_000_000;
const THOUSAND_THRESHOLD = 1000;

// Visit calculation constants
const FOLLOWER_TO_VISIT_RATIO = 1.67;
const HIGH_LISTED_COUNT_THRESHOLD = 100;
const HIGH_LISTED_COUNT_MULTIPLIER = 1.2;
const HIGH_TWEET_COUNT_THRESHOLD = 10_000;
const HIGH_TWEET_COUNT_MULTIPLIER = 1.1;
const VERIFIED_MULTIPLIER = 1.15;

type UserCardProps = {
  user: {
    name: string;
    image: string | null;
    twitterUsername: string | null;
    twitterBio: string | null;
    twitterLocation: string | null;
    twitterUrl: string | null;
    twitterBannerUrl: string | null;
    twitterVerified: boolean | null;
    twitterVerifiedType: string | null;
    twitterVerifiedFollowers: number | null;
    twitterFollowers: number | null;
    twitterFollowing: number | null;
    twitterTweetCount: number | null;
    twitterListedCount: number | null;
    twitterCreatedAt: Date | null;
  };
};

export function UserCard({ user }: UserCardProps) {
  const formatNumber = (num: number | null) => {
    if (!num) {
      return "0";
    }
    if (num >= MILLION_THRESHOLD) {
      return `${(num / MILLION_THRESHOLD).toFixed(1)}M`;
    }
    if (num >= THOUSAND_THRESHOLD) {
      return `${(num / THOUSAND_THRESHOLD).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Calculate estimated MONTHLY profile visits (banner views)
  // Formula validated with real X analytics: 6.5K visits from 3.9K followers = 1.67x
  const estimateMonthlyProfileVisits = () => {
    const followers = user.twitterFollowers || 0;
    const listed = user.twitterListedCount || 0;
    const tweets = user.twitterTweetCount || 0;

    // Base formula: 1.67x followers per month (from real data validation)
    let monthlyVisits = followers * FOLLOWER_TO_VISIT_RATIO;

    // Adjustments based on account quality

    // High engagement accounts (many lists) get +20%
    if (listed > HIGH_LISTED_COUNT_THRESHOLD) {
      monthlyVisits *= HIGH_LISTED_COUNT_MULTIPLIER;
    }

    // Very active accounts (high tweet volume) get +10%
    if (tweets > HIGH_TWEET_COUNT_THRESHOLD) {
      monthlyVisits *= HIGH_TWEET_COUNT_MULTIPLIER;
    }

    // Verified accounts get +15% (blue checkmark attracts more clicks)
    if (user.twitterVerified || user.twitterVerifiedType) {
      monthlyVisits *= VERIFIED_MULTIPLIER;
    }

    return Math.round(monthlyVisits);
  };

  const estimatedMonthlyVisits = estimateMonthlyProfileVisits();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Banner */}
      <div className="relative h-32 bg-linear-to-r from-blue-500 to-purple-500">
        {user.twitterBannerUrl && (
          <Image
            alt="Profile banner"
            className="object-cover"
            fill
            priority
            src={user.twitterBannerUrl}
            unoptimized
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="-mt-12 p-4">
        <div className="flex items-start justify-between">
          {/* Profile Image */}
          <div className="relative">
            {user.image ? (
              <Image
                alt={user.name}
                className="rounded-full border-4 border-background"
                height={80}
                src={user.image}
                width={80}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-gray-200">
                <span className="text-2xl">{user.name[0]}</span>
              </div>
            )}
          </div>

          {/* Verified Badge */}
          {user.twitterVerified && (
            <Badge className="mt-14" variant="secondary">
              ✓ Verified
            </Badge>
          )}
        </div>

        {/* User Info */}
        <div className="mt-4">
          <h3 className="font-bold text-xl">{user.name}</h3>
          {user.twitterUsername && (
            <p className="text-muted-foreground">@{user.twitterUsername}</p>
          )}
        </div>

        {/* Bio */}
        {user.twitterBio && (
          <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm">
            {user.twitterBio}
          </p>
        )}

        {/* Location */}
        {user.twitterLocation && (
          <p className="mt-2 flex items-center gap-1 text-muted-foreground text-sm">
            <span>📍</span>
            {user.twitterLocation}
          </p>
        )}

        {/* Estimated Monthly Profile Visits (Banner Views) */}
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              Est. Profile Visits/Month
            </span>
            <span className="font-bold text-primary text-xl">
              {formatNumber(estimatedMonthlyVisits)}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            = Banner impressions per month
          </p>
        </div>

        {/* Additional Metrics */}
        <div className="mt-3 space-y-2 text-xs">
          {user.twitterVerifiedFollowers ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified Followers</span>
              <span className="font-semibold">
                {formatNumber(user.twitterVerifiedFollowers)}
              </span>
            </div>
          ) : null}
          {user.twitterListedCount ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed</span>
              <span className="font-semibold">
                {formatNumber(user.twitterListedCount)}
              </span>
            </div>
          ) : null}
          {user.twitterVerifiedType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified Type</span>
              <span className="font-semibold capitalize">
                {user.twitterVerifiedType}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-around border-t pt-4">
          <div className="text-center">
            <p className="font-bold text-2xl">
              {formatNumber(user.twitterFollowers)}
            </p>
            <p className="text-muted-foreground text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl">
              {formatNumber(user.twitterFollowing)}
            </p>
            <p className="text-muted-foreground text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl">
              {formatNumber(user.twitterTweetCount)}
            </p>
            <p className="text-muted-foreground text-xs">Tweets</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
