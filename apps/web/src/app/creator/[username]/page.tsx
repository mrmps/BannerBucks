"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/categories";
import { formatNumber } from "@/lib/format-number";
import { client } from "@/utils/orpc";

// Constants for visit calculations
const FOLLOWER_TO_VISIT_RATIO = 1.67;
const HIGH_LISTED_COUNT_THRESHOLD = 100;
const HIGH_LISTED_COUNT_MULTIPLIER = 1.2;
const HIGH_TWEET_COUNT_THRESHOLD = 10_000;
const HIGH_TWEET_COUNT_MULTIPLIER = 1.1;
const VERIFIED_MULTIPLIER = 1.15;

// Constants for pricing calculations
const IMPRESSIONS_PER_THOUSAND = 1000;
const CPM_RANGE_MULTIPLIER = 1.5;

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
  });

  const creator = users.find(
    (u) => u.twitterUsername?.toLowerCase() === username.toLowerCase()
  );

  // Calculate estimated visits
  const estimateMonthlyVisits = () => {
    if (!creator) {
      return 0;
    }
    const followers = creator.twitterFollowers || 0;
    const listed = creator.twitterListedCount || 0;
    const tweets = creator.twitterTweetCount || 0;

    let monthlyVisits = followers * FOLLOWER_TO_VISIT_RATIO;

    if (listed > HIGH_LISTED_COUNT_THRESHOLD) {
      monthlyVisits *= HIGH_LISTED_COUNT_MULTIPLIER;
    }
    if (tweets > HIGH_TWEET_COUNT_THRESHOLD) {
      monthlyVisits *= HIGH_TWEET_COUNT_MULTIPLIER;
    }
    if (creator.twitterVerified || creator.twitterVerifiedType) {
      monthlyVisits *= VERIFIED_MULTIPLIER;
    }

    return Math.round(monthlyVisits);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-12 text-center">
          <h2 className="mb-4 font-bold text-2xl">Creator not found</h2>
          <p className="mb-6 text-muted-foreground">
            This creator doesn't exist or isn't available for sponsorship.
          </p>
          <Button onClick={() => router.push("/")}>Back to Directory</Button>
        </Card>
      </div>
    );
  }

  const monthlyVisits = estimateMonthlyVisits();
  const categories = creator.creatorCategories
    ? JSON.parse(creator.creatorCategories)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Hero */}
      <div className="relative h-64 bg-linear-to-r from-blue-500 to-purple-500">
        {creator.twitterBannerUrl && (
          <Image
            alt="Profile banner"
            className="object-cover"
            fill
            priority
            src={creator.twitterBannerUrl}
            unoptimized
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="-mt-20 container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {creator.image ? (
                <Image
                  alt={creator.name}
                  className="rounded-full border-4 border-background"
                  height={160}
                  src={creator.image}
                  width={160}
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-background bg-gray-200">
                  <span className="text-4xl">{creator.name[0]}</span>
                </div>
              )}
            </div>

            {/* Name & Actions */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="flex items-center gap-2 font-bold text-4xl">
                    {creator.name}
                    {creator.twitterVerified && <Badge>✓ Verified</Badge>}
                  </h1>
                  {creator.twitterUsername && (
                    <p className="text-muted-foreground text-xl">
                      @{creator.twitterUsername}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() =>
                    router.push(
                      `https://twitter.com/${creator.twitterUsername}`
                    )
                  }
                  size="lg"
                >
                  Contact Creator
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="font-bold text-3xl">
                {formatNumber(creator.twitterFollowers)}
              </p>
              <p className="text-muted-foreground text-sm">Followers</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="font-bold text-3xl">
                {formatNumber(monthlyVisits)}
              </p>
              <p className="text-muted-foreground text-sm">Est. Visits/Month</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="font-bold text-3xl">
                {formatNumber(creator.twitterVerifiedFollowers)}
              </p>
              <p className="text-muted-foreground text-sm">
                Verified Followers
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="font-bold text-3xl">
                {formatNumber(creator.twitterTweetCount)}
              </p>
              <p className="text-muted-foreground text-sm">Tweets</p>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Info */}
            <div className="space-y-6 md:col-span-2">
              {/* Bio */}
              {creator.twitterBio && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">About</h3>
                  <p className="whitespace-pre-line">{creator.twitterBio}</p>
                </Card>
              )}

              {/* Looking For */}
              {creator.creatorLookingFor && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">Looking For</h3>
                  <p className="whitespace-pre-line">
                    {creator.creatorLookingFor}
                  </p>
                </Card>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((catValue: string) => {
                      const cat = CATEGORIES.find((c) => c.value === catValue);
                      return cat ? (
                        <Badge key={catValue} variant="secondary">
                          {cat.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              {creator.creatorPriceMin && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">💰 Pricing</h3>
                  <p className="mb-1 font-bold text-2xl">
                    ${creator.creatorPriceMin}-${creator.creatorPriceMax}
                  </p>
                  <p className="text-muted-foreground text-sm">per week</p>
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-1 text-muted-foreground text-sm">
                      Est. CPM
                    </p>
                    <p className="font-semibold">
                      $
                      {Math.round(
                        (((creator.creatorPriceMin || 0) +
                          (creator.creatorPriceMax || 0)) /
                          2 /
                          monthlyVisits) *
                          IMPRESSIONS_PER_THOUSAND
                      )}
                      -$
                      {Math.round(
                        (((creator.creatorPriceMin || 0) +
                          (creator.creatorPriceMax || 0)) /
                          2 /
                          monthlyVisits) *
                          IMPRESSIONS_PER_THOUSAND *
                          CPM_RANGE_MULTIPLIER
                      )}
                    </p>
                  </div>
                </Card>
              )}

              {/* Contact */}
              {creator.creatorContactMethod && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">📬 Contact</h3>
                  {creator.creatorContactMethod === "twitter" && (
                    <div>
                      <p className="mb-2 text-muted-foreground text-sm">
                        Twitter DM
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(
                            `https://twitter.com/messages/compose?recipient_id=${creator.twitterId}`,
                            "_blank"
                          )
                        }
                      >
                        Send DM
                      </Button>
                    </div>
                  )}
                  {creator.creatorContactMethod === "email" && (
                    <div>
                      <p className="mb-2 text-muted-foreground text-sm">
                        Email
                      </p>
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(
                            `mailto:${creator.creatorContactValue}`,
                            "_blank"
                          )
                        }
                      >
                        Send Email
                      </Button>
                    </div>
                  )}
                  {creator.creatorContactMethod === "other" && (
                    <div>
                      <p className="mb-2 text-muted-foreground text-sm">
                        Contact
                      </p>
                      <p className="font-mono text-sm">
                        {creator.creatorContactValue}
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Additional Info */}
              {creator.twitterLocation && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">📍 Location</h3>
                  <p className="text-sm">{creator.twitterLocation}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
