"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/loader";
import { PlatformBanner } from "@/components/platform-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCard } from "@/components/user-card";
import { authClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/lib/categories";
import type { User } from "@/lib/types";
import { client, queryClient } from "@/utils/orpc";

// Helper functions to reduce complexity
function matchesSearchQuery(user: User, query: string): boolean {
  if (!query) {
    return true;
  }
  const lowerQuery = query.toLowerCase();
  return !!(
    user.name?.toLowerCase().includes(lowerQuery) ||
    user.twitterUsername?.toLowerCase().includes(lowerQuery) ||
    user.twitterBio?.toLowerCase().includes(lowerQuery)
  );
}

function matchesFollowerFilter(user: User, minFollowers: number): boolean {
  if (minFollowers === 0) {
    return true;
  }
  return (user.twitterFollowers || 0) >= minFollowers;
}

function matchesPriceFilter(
  user: User,
  minPrice: number | null,
  maxPrice: number | null
): boolean {
  if (minPrice !== null && (user.creatorPriceMax || 0) < minPrice) {
    return false;
  }
  if (
    maxPrice !== null &&
    (user.creatorPriceMin || Number.POSITIVE_INFINITY) > maxPrice
  ) {
    return false;
  }
  return true;
}

function matchesCategoryFilter(
  user: User,
  selectedCategories: string[]
): boolean {
  if (selectedCategories.length === 0) {
    return true;
  }
  if (!user.creatorCategories) {
    return false;
  }
  const userCategories = JSON.parse(user.creatorCategories);
  return selectedCategories.some((cat) => userCategories.includes(cat));
}

function isValidCreator(user: User): boolean {
  if (!user.twitterId) {
    return false;
  }
  const isCreatorRole = user.role === "creator" || user.role === "both";
  return isCreatorRole && user.creatorStatus === "available";
}

function isValidSponsor(user: User): boolean {
  if (!user.twitterId) {
    return false;
  }
  const isSponsorRole = user.role === "sponsor" || user.role === "both";
  return isSponsorRole && user.sponsorStatus === "active";
}

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"creators" | "sponsors">(
    "creators"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Fetch all users using ORPC
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
  });

  // Auto-sync Twitter data when user logs in
  const syncMutation = useMutation({
    mutationFn: () => client.twitter.sync({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users.getAll"] });
    },
  });

  // Trigger sync on mount if logged in and not already synced
  const currentUser = users.find(
    (u: { id: string; twitterId: string | null }) => u.id === session?.user?.id
  );
  const needsSync = session?.user && !currentUser?.twitterId;

  if (needsSync && !syncMutation.isPending) {
    syncMutation.mutate();
  }

  // Filter creators
  const creators = users.filter(
    (u: User) =>
      isValidCreator(u) &&
      matchesSearchQuery(u, searchQuery) &&
      matchesFollowerFilter(u, minFollowers) &&
      matchesPriceFilter(u, minPrice, maxPrice) &&
      matchesCategoryFilter(u, selectedCategories)
  );

  // Filter sponsors
  const sponsors = users.filter(isValidSponsor);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformBanner />

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="font-bold text-3xl">Monetize Banner</h1>
            <p className="text-muted-foreground">
              Turn your Twitter profile into revenue
            </p>
          </div>
          {session ? (
            <Button
              className="font-semibold"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              className="font-semibold"
              onClick={() => router.push("/login")}
              size="lg"
            >
              Sign in with Twitter / X
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b">
          <button
            className={`px-4 pb-3 font-semibold transition-colors ${
              activeTab === "creators"
                ? "border-primary border-b-2 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("creators")}
            type="button"
          >
            Creators ({creators.length})
          </button>
          <button
            className={`px-4 pb-3 font-semibold transition-colors ${
              activeTab === "sponsors"
                ? "border-primary border-b-2 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("sponsors")}
            type="button"
          >
            Sponsors ({sponsors.length})
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 shrink-0">
            <Card className="sticky top-4 p-4">
              <h3 className="mb-4 font-semibold">Filters</h3>

              {/* Search */}
              <div className="mb-4">
                <label
                  className="mb-2 block font-medium text-sm"
                  htmlFor="search-input"
                >
                  Search
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  id="search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  type="text"
                  value={searchQuery}
                />
              </div>

              {activeTab === "creators" && (
                <>
                  {/* Followers Filter */}
                  <div className="mb-4">
                    <label
                      className="mb-2 block font-medium text-sm"
                      htmlFor="min-followers"
                    >
                      Min Followers
                    </label>
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      id="min-followers"
                      onChange={(e) => setMinFollowers(Number(e.target.value))}
                      value={minFollowers}
                    >
                      <option value="0">All</option>
                      <option value="1000">1K+</option>
                      <option value="5000">5K+</option>
                      <option value="10000">10K+</option>
                      <option value="50000">50K+</option>
                      <option value="100000">100K+</option>
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div className="mb-4">
                    <label
                      className="mb-2 block font-medium text-sm"
                      htmlFor="min-price"
                    >
                      Price Range ($/week)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded border px-2 py-1 text-sm"
                        id="min-price"
                        onChange={(e) =>
                          setMinPrice(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="Min"
                        type="number"
                        value={minPrice || ""}
                      />
                      <input
                        aria-label="Maximum price"
                        className="rounded border px-2 py-1 text-sm"
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="Max"
                        type="number"
                        value={maxPrice || ""}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Categories */}
              <div className="mb-4">
                <p className="mb-2 block font-medium text-sm">Categories</p>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {CATEGORIES.map((cat) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-sm"
                      key={cat.value}
                    >
                      <input
                        checked={selectedCategories.includes(cat.value)}
                        className="h-4 w-4"
                        onChange={() => toggleCategory(cat.value)}
                        type="checkbox"
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setMinFollowers(0);
                  setMinPrice(null);
                  setMaxPrice(null);
                  setSelectedCategories([]);
                }}
                size="sm"
                variant="outline"
              >
                Clear Filters
              </Button>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {activeTab === "creators" &&
              (creators.length === 0 ? (
                <Card className="p-12 text-center">
                  <h2 className="mb-4 font-bold text-2xl">No creators found</h2>
                  <p className="mb-8 text-muted-foreground">
                    {users.length === 0
                      ? "Be the first to sign in and showcase your Twitter profile!"
                      : "Try adjusting your filters or check back later."}
                  </p>
                  {!session && (
                    <Button onClick={() => router.push("/login")} size="lg">
                      Sign in with Twitter / X
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <h2 className="mb-6 font-bold text-2xl">
                    {creators.length} Creator
                    {creators.length !== 1 ? "s" : ""} Available
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {creators.map((user: User) => (
                      <div className="relative" key={user.id}>
                        <UserCard user={user} />
                        {user.creatorPriceMin && (
                          <div className="absolute top-2 right-2">
                            <div className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground text-xs">
                              ${user.creatorPriceMin}-${user.creatorPriceMax}
                              /wk
                            </div>
                          </div>
                        )}
                        <Button
                          className="mt-3 w-full"
                          onClick={() =>
                            router.push(`/creator/${user.twitterUsername}`)
                          }
                          variant="outline"
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {activeTab === "sponsors" &&
              (sponsors.length === 0 ? (
                <Card className="p-12 text-center">
                  <h2 className="mb-4 font-bold text-2xl">No sponsors yet</h2>
                  <p className="mb-8 text-muted-foreground">
                    Be the first sponsor to join the platform!
                  </p>
                  {!session && (
                    <Button onClick={() => router.push("/login")} size="lg">
                      Sign in to Sponsor
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <h2 className="mb-6 font-bold text-2xl">
                    {sponsors.length} Active Sponsor
                    {sponsors.length !== 1 ? "s" : ""}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sponsors.map((sponsor: User) => (
                      <Card className="p-6" key={sponsor.id}>
                        <div className="mb-4 flex items-start gap-3">
                          {sponsor.image && (
                            <img
                              alt={sponsor.name}
                              className="h-12 w-12 rounded-full"
                              height={48}
                              src={sponsor.image}
                              width={48}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold">
                              {sponsor.sponsorCompanyName || sponsor.name}
                            </h3>
                            {sponsor.twitterUsername && (
                              <p className="text-muted-foreground text-sm">
                                @{sponsor.twitterUsername}
                              </p>
                            )}
                          </div>
                        </div>
                        {sponsor.sponsorBudgetMin && (
                          <p className="mb-2 font-semibold text-sm">
                            Budget: ${sponsor.sponsorBudgetMin}-$
                            {sponsor.sponsorBudgetMax}/week
                          </p>
                        )}
                        {sponsor.sponsorLookingFor && (
                          <p className="mb-4 line-clamp-3 text-muted-foreground text-sm">
                            {sponsor.sponsorLookingFor}
                          </p>
                        )}
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(`/sponsor/${sponsor.twitterUsername}`)
                          }
                          variant="outline"
                        >
                          View Profile
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      {!session && (creators.length > 0 || sponsors.length > 0) && (
        <div className="border-t bg-muted">
          <div className="container mx-auto px-4 py-12 text-center">
            <h3 className="mb-4 font-bold text-2xl">
              Ready to{" "}
              {activeTab === "creators"
                ? "monetize your Twitter banner"
                : "sponsor creators"}
              ?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Join{" "}
              {activeTab === "creators" ? creators.length : sponsors.length}{" "}
              {(() => {
                if (activeTab === "creators") {
                  return creators.length === 1 ? "creator" : "creators";
                }
                return sponsors.length === 1 ? "sponsor" : "sponsors";
              })()} already on the platform
            </p>
            <Button
              className="font-semibold"
              onClick={() => router.push("/login")}
              size="lg"
            >
              Sign in with Twitter / X
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
