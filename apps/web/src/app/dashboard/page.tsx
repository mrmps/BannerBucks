"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { SyncTwitterButton } from "@/components/sync-twitter-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCard } from "@/components/user-card";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Fetch all users using ORPC
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
    enabled: !!session,
  });

  // Find current user's data
  const userData = users.find((u) => u.id === session?.user?.id);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Redirect to onboarding if role not set
  useEffect(() => {
    if (userData && !userData.role) {
      router.push("/onboarding");
    }
  }, [userData, router]);

  // Show loading while checking auth/data
  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show loading while redirecting
  if (!session || (userData && !userData.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const isCreator = userData?.role === "creator" || userData?.role === "both";
  const isSponsor = userData?.role === "sponsor" || userData?.role === "both";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="font-bold text-3xl">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name}!
            </p>
          </div>
          <div className="flex gap-2">
            <SyncTwitterButton />
            <Button onClick={() => router.push("/")} variant="outline">
              Home
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Creator Setup Banner */}
          {isCreator && !userData.creatorStatus && (
            <Card className="border-primary bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-lg">
                    ⚠️ Complete your creator profile to appear in directory!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Set your price range and preferences to get discovered by
                    sponsors
                  </p>
                </div>
                <Button onClick={() => router.push("/dashboard/settings")}>
                  Complete Setup →
                </Button>
              </div>
            </Card>
          )}

          {/* Sponsor Setup Banner */}
          {isSponsor && !userData.sponsorStatus && (
            <Card className="border-primary bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-lg">
                    ⚠️ Complete your sponsor profile!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Set your budget and preferences to find creators
                  </p>
                </div>
                <Button onClick={() => router.push("/sponsor/settings")}>
                  Complete Setup →
                </Button>
              </div>
            </Card>
          )}

          {/* Creator Section */}
          {isCreator && (
            <div>
              <h2 className="mb-6 font-bold text-2xl">Your Creator Profile</h2>
              {userData?.creatorStatus ? (
                <div className="space-y-6">
                  <UserCard user={userData} />

                  <Card className="p-6">
                    <h3 className="mb-4 font-semibold text-lg">Your Listing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-semibold">
                          {userData.creatorStatus === "available" &&
                            "🟢 Available"}
                          {userData.creatorStatus === "unavailable" &&
                            "🟡 Unavailable"}
                          {userData.creatorStatus === "hidden" && "⚫ Hidden"}
                        </span>
                      </div>
                      {userData.creatorPriceMin && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Price Range
                          </span>
                          <span className="font-semibold">
                            ${userData.creatorPriceMin}-$
                            {userData.creatorPriceMax}/week
                          </span>
                        </div>
                      )}
                      {userData.creatorCategories && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Categories
                          </span>
                          <span className="font-semibold">
                            {JSON.parse(userData.creatorCategories).length}{" "}
                            selected
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => router.push("/dashboard/settings")}
                        variant="outline"
                      >
                        Edit Settings
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() =>
                          router.push(`/creator/${userData.twitterUsername}`)
                        }
                        variant="outline"
                      >
                        Preview Profile
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : null}
            </div>
          )}

          {/* Sponsor Section */}
          {isSponsor && (
            <div>
              <h2 className="mb-6 font-bold text-2xl">Your Sponsor Profile</h2>
              {userData?.sponsorStatus ? (
                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-lg">
                    {userData.sponsorCompanyName || "Your Company"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold">
                        {userData.sponsorStatus === "active" && "🟢 Active"}
                        {userData.sponsorStatus === "inactive" && "🟡 Inactive"}
                        {userData.sponsorStatus === "hidden" && "⚫ Hidden"}
                      </span>
                    </div>
                    {userData.sponsorBudgetMin && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Budget Range
                        </span>
                        <span className="font-semibold">
                          ${userData.sponsorBudgetMin}-$
                          {userData.sponsorBudgetMax}/week
                        </span>
                      </div>
                    )}
                    {userData.sponsorCategories && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Interested In
                        </span>
                        <span className="font-semibold">
                          {JSON.parse(userData.sponsorCategories).length}{" "}
                          categories
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => router.push("/sponsor/settings")}
                      variant="outline"
                    >
                      Edit Settings
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => router.push("/?tab=creators")}
                    >
                      Browse Creators
                    </Button>
                  </div>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
