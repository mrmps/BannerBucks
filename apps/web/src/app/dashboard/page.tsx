"use client";

import { authClient } from "@/lib/auth-client";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { SyncTwitterButton } from "@/components/sync-twitter-button";
import { redirect } from "next/navigation";

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
	const userData = users.find((u: any) => u.id === session?.user?.id);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	// Show loading while checking auth/data
	if (isPending || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!session) {
		router.push("/login");
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	// Redirect to onboarding if role not set
	if (userData && !userData.role) {
		router.push("/onboarding");
		return (
			<div className="min-h-screen flex items-center justify-center">
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
				<div className="container mx-auto px-4 py-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-muted-foreground">Welcome back, {session?.user?.name}!</p>
					</div>
					<div className="flex gap-2">
						<SyncTwitterButton />
						<Button variant="outline" onClick={() => router.push("/")}>
							Home
						</Button>
						<Button variant="outline" onClick={handleSignOut}>
							Sign Out
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-12">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Creator Setup Banner */}
					{isCreator && !userData.creatorStatus && (
						<Card className="p-6 border-primary bg-primary/5">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold mb-1">
										⚠️ Complete your creator profile to appear in directory!
									</h3>
									<p className="text-sm text-muted-foreground">
										Set your price range and preferences to get discovered by sponsors
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
						<Card className="p-6 border-primary bg-primary/5">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold mb-1">
										⚠️ Complete your sponsor profile!
									</h3>
									<p className="text-sm text-muted-foreground">
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
							<h2 className="text-2xl font-bold mb-6">Your Creator Profile</h2>
							{userData?.creatorStatus ? (
								<div className="space-y-6">
									<UserCard user={userData} />
									
									<Card className="p-6">
										<h3 className="text-lg font-semibold mb-4">Your Listing</h3>
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Status</span>
												<span className="font-semibold">
													{userData.creatorStatus === "available" && "🟢 Available"}
													{userData.creatorStatus === "unavailable" && "🟡 Unavailable"}
													{userData.creatorStatus === "hidden" && "⚫ Hidden"}
												</span>
											</div>
											{userData.creatorPriceMin && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Price Range</span>
													<span className="font-semibold">
														${userData.creatorPriceMin}-${userData.creatorPriceMax}/week
													</span>
												</div>
											)}
											{userData.creatorCategories && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">Categories</span>
													<span className="font-semibold">
														{JSON.parse(userData.creatorCategories).length} selected
													</span>
												</div>
											)}
										</div>
										<div className="flex gap-2 mt-4">
											<Button
												variant="outline"
												onClick={() => router.push("/dashboard/settings")}
												className="flex-1"
											>
												Edit Settings
											</Button>
											<Button
												variant="outline"
												onClick={() =>
													router.push(`/creator/${userData.twitterUsername}`)
												}
												className="flex-1"
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
							<h2 className="text-2xl font-bold mb-6">Your Sponsor Profile</h2>
							{userData?.sponsorStatus ? (
								<Card className="p-6">
									<h3 className="text-lg font-semibold mb-4">
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
												<span className="text-muted-foreground">Budget Range</span>
												<span className="font-semibold">
													${userData.sponsorBudgetMin}-${userData.sponsorBudgetMax}/week
												</span>
											</div>
										)}
										{userData.sponsorCategories && (
											<div className="flex justify-between">
												<span className="text-muted-foreground">Interested In</span>
												<span className="font-semibold">
													{JSON.parse(userData.sponsorCategories).length} categories
												</span>
											</div>
										)}
									</div>
									<div className="flex gap-2 mt-4">
										<Button
											variant="outline"
											onClick={() => router.push("/sponsor/settings")}
											className="flex-1"
										>
											Edit Settings
										</Button>
										<Button
											onClick={() => router.push("/?tab=creators")}
											className="flex-1"
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
