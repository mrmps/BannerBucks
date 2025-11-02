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

export default function SponsorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
  });

  const sponsor = users.find(
    (u) => u.twitterUsername?.toLowerCase() === username.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!sponsor?.sponsorStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-12 text-center">
          <h2 className="mb-4 font-bold text-2xl">Sponsor not found</h2>
          <p className="mb-6 text-muted-foreground">
            This sponsor doesn't exist or isn't active.
          </p>
          <Button onClick={() => router.push("/?tab=sponsors")}>
            Back to Sponsors
          </Button>
        </Card>
      </div>
    );
  }

  const categories = sponsor.sponsorCategories
    ? JSON.parse(sponsor.sponsorCategories)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              {sponsor.image ? (
                <Image
                  alt={sponsor.name}
                  className="rounded-full border-4 border-background"
                  height={120}
                  src={sponsor.image}
                  width={120}
                />
              ) : (
                <div className="flex h-30 w-30 items-center justify-center rounded-full border-4 border-background bg-gray-200">
                  <span className="text-3xl">{sponsor.name[0]}</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="mb-2 font-bold text-4xl">
                      {sponsor.sponsorCompanyName || sponsor.name}
                    </h1>
                    {sponsor.twitterUsername && (
                      <p className="mb-2 text-muted-foreground text-xl">
                        @{sponsor.twitterUsername}
                      </p>
                    )}
                    {sponsor.sponsorIndustry && (
                      <Badge variant="secondary">
                        {sponsor.sponsorIndustry}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() =>
                      window.open(
                        `https://twitter.com/${sponsor.twitterUsername}`,
                        "_blank"
                      )
                    }
                    size="lg"
                  >
                    View on Twitter
                  </Button>
                </div>

                {sponsor.twitterBio && (
                  <p className="mt-4 whitespace-pre-line text-muted-foreground">
                    {sponsor.twitterBio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget */}
              {sponsor.sponsorBudgetMin && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">💰 Budget Range</h3>
                  <p className="mb-1 font-bold text-2xl">
                    ${sponsor.sponsorBudgetMin}-${sponsor.sponsorBudgetMax}
                  </p>
                  <p className="text-muted-foreground text-sm">per week</p>
                </Card>
              )}

              {/* Website */}
              {sponsor.sponsorCompanyWebsite && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">🌐 Website</h3>
                  <Button
                    className="w-full"
                    onClick={() =>
                      window.open(sponsor.sponsorCompanyWebsite || "", "_blank")
                    }
                    variant="outline"
                  >
                    Visit Website
                  </Button>
                </Card>
              )}

              {/* Stats */}
              <Card className="p-6">
                <h3 className="mb-3 font-semibold">📊 Twitter Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-semibold">
                      {formatNumber(sponsor.twitterFollowers)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Following</span>
                    <span className="font-semibold">
                      {formatNumber(sponsor.twitterFollowing)}
                    </span>
                  </div>
                  {sponsor.twitterVerified && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified</span>
                      <span className="font-semibold">✓ Yes</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6 md:col-span-2">
              {/* Looking For */}
              {sponsor.sponsorLookingFor && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">🎯 Looking For</h3>
                  <p className="whitespace-pre-line">
                    {sponsor.sponsorLookingFor}
                  </p>
                </Card>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-3 font-semibold">
                    📂 Interested Categories
                  </h3>
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

              {/* CTA */}
              <Card className="bg-primary/5 p-6">
                <h3 className="mb-3 font-semibold">
                  Interested in working with{" "}
                  {sponsor.sponsorCompanyName || sponsor.name}?
                </h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Reach out via Twitter to discuss sponsorship opportunities.
                </p>
                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/messages/compose?recipient_id=${sponsor.twitterId}`,
                      "_blank"
                    )
                  }
                >
                  Send Twitter DM
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
