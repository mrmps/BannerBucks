"use client";

import { UserCard } from "@/components/user-card";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { client, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlatformBanner } from "@/components/platform-banner";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"creators" | "sponsors">("creators");
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
	const currentUser = users.find((u: { id: string; twitterId: string | null }) => u.id === session?.user?.id);
	const needsSync = session?.user && !currentUser?.twitterId;

	if (needsSync && !syncMutation.isPending) {
		syncMutation.mutate();
	}

	// Filter creators
	const creators = users.filter((u: any) => {
		if (!u.twitterId) return false;
		const isCreatorRole = u.role === "creator" || u.role === "both";
		if (!isCreatorRole || u.creatorStatus !== "available") return false;

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				u.name?.toLowerCase().includes(query) ||
				u.twitterUsername?.toLowerCase().includes(query) ||
				u.twitterBio?.toLowerCase().includes(query);
			if (!matchesSearch) return false;
		}

		// Followers filter
		if (minFollowers > 0 && (u.twitterFollowers || 0) < minFollowers) {
			return false;
		}

		// Price filter
		if (minPrice !== null && (u.creatorPriceMax || 0) < minPrice) {
			return false;
		}
		if (maxPrice !== null && (u.creatorPriceMin || Infinity) > maxPrice) {
			return false;
		}

		// Category filter
		if (selectedCategories.length > 0 && u.creatorCategories) {
			const userCategories = JSON.parse(u.creatorCategories);
			const hasMatch = selectedCategories.some((cat) => userCategories.includes(cat));
			if (!hasMatch) return false;
		}

		return true;
	});

	// Filter sponsors
	const sponsors = users.filter((u: any) => {
		if (!u.twitterId) return false;
		const isSponsorRole = u.role === "sponsor" || u.role === "both";
		return isSponsorRole && u.sponsorStatus === "active";
	});

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<PlatformBanner />

			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Monetize Banner</h1>
						<p className="text-muted-foreground">
							Turn your Twitter profile into revenue
						</p>
					</div>
					{session ? (
						<Button
							onClick={() => router.push("/dashboard")}
							className="font-semibold"
						>
							Go to Dashboard
						</Button>
					) : (
						<Button
							onClick={() => router.push("/login")}
							size="lg"
							className="font-semibold"
						>
							Sign in with Twitter / X
						</Button>
					)}
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				{/* Tabs */}
				<div className="flex gap-4 mb-8 border-b">
					<button
						onClick={() => setActiveTab("creators")}
						className={`pb-3 px-4 font-semibold transition-colors ${
							activeTab === "creators"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Creators ({creators.length})
					</button>
					<button
						onClick={() => setActiveTab("sponsors")}
						className={`pb-3 px-4 font-semibold transition-colors ${
							activeTab === "sponsors"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Sponsors ({sponsors.length})
					</button>
				</div>

				<div className="flex gap-8">
					{/* Filters Sidebar */}
					<aside className="w-64 flex-shrink-0">
						<Card className="p-4 sticky top-4">
							<h3 className="font-semibold mb-4">Filters</h3>

							{/* Search */}
							<div className="mb-4">
								<label className="text-sm font-medium mb-2 block">Search</label>
								<input
									type="text"
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-3 py-2 border rounded-lg text-sm"
								/>
							</div>

							{activeTab === "creators" && (
								<>
									{/* Followers Filter */}
									<div className="mb-4">
										<label className="text-sm font-medium mb-2 block">
											Min Followers
										</label>
										<select
											value={minFollowers}
											onChange={(e) => setMinFollowers(Number(e.target.value))}
											className="w-full px-3 py-2 border rounded-lg text-sm"
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
										<label className="text-sm font-medium mb-2 block">
											Price Range ($/week)
										</label>
										<div className="grid grid-cols-2 gap-2">
											<input
												type="number"
												placeholder="Min"
												value={minPrice || ""}
												onChange={(e) =>
													setMinPrice(e.target.value ? Number(e.target.value) : null)
												}
												className="px-2 py-1 border rounded text-sm"
											/>
											<input
												type="number"
												placeholder="Max"
												value={maxPrice || ""}
												onChange={(e) =>
													setMaxPrice(e.target.value ? Number(e.target.value) : null)
												}
												className="px-2 py-1 border rounded text-sm"
											/>
										</div>
									</div>
								</>
							)}

							{/* Categories */}
							<div className="mb-4">
								<label className="text-sm font-medium mb-2 block">Categories</label>
								<div className="space-y-2 max-h-64 overflow-y-auto">
									{CATEGORIES.map((cat) => (
										<label
											key={cat.value}
											className="flex items-center gap-2 text-sm cursor-pointer"
										>
											<input
												type="checkbox"
												checked={selectedCategories.includes(cat.value)}
												onChange={() => toggleCategory(cat.value)}
												className="w-4 h-4"
											/>
											{cat.label}
										</label>
									))}
								</div>
							</div>

							{/* Clear Filters */}
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								onClick={() => {
									setSearchQuery("");
									setMinFollowers(0);
									setMinPrice(null);
									setMaxPrice(null);
									setSelectedCategories([]);
								}}
							>
								Clear Filters
							</Button>
						</Card>
					</aside>

					{/* Results */}
					<div className="flex-1">
						{activeTab === "creators" ? (
							creators.length === 0 ? (
								<Card className="p-12 text-center">
									<h2 className="text-2xl font-bold mb-4">No creators found</h2>
									<p className="text-muted-foreground mb-8">
										{users.length === 0
											? "Be the first to sign in and showcase your Twitter profile!"
											: "Try adjusting your filters or check back later."}
									</p>
									{!session && (
										<Button
											onClick={() => router.push("/login")}
											size="lg"
										>
											Sign in with Twitter / X
										</Button>
									)}
								</Card>
							) : (
								<div>
									<h2 className="text-2xl font-bold mb-6">
										{creators.length} Creator{creators.length !== 1 ? "s" : ""} Available
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{creators.map((user: any) => (
											<div key={user.id} className="relative">
												<UserCard user={user} />
												{user.creatorPriceMin && (
													<div className="absolute top-2 right-2">
														<div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
															${user.creatorPriceMin}-${user.creatorPriceMax}/wk
														</div>
													</div>
												)}
												<Button
													onClick={() => router.push(`/creator/${user.twitterUsername}`)}
													className="w-full mt-3"
													variant="outline"
												>
													View Profile
												</Button>
											</div>
										))}
									</div>
								</div>
							)
						) : (
							// Sponsors Tab
							sponsors.length === 0 ? (
								<Card className="p-12 text-center">
									<h2 className="text-2xl font-bold mb-4">No sponsors yet</h2>
									<p className="text-muted-foreground mb-8">
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
									<h2 className="text-2xl font-bold mb-6">
										{sponsors.length} Active Sponsor{sponsors.length !== 1 ? "s" : ""}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{sponsors.map((sponsor: any) => (
											<Card key={sponsor.id} className="p-6">
												<div className="flex items-start gap-3 mb-4">
													{sponsor.image && (
														<img
															src={sponsor.image}
															alt={sponsor.name}
															className="w-12 h-12 rounded-full"
														/>
													)}
													<div className="flex-1">
														<h3 className="font-bold">
															{sponsor.sponsorCompanyName || sponsor.name}
														</h3>
														{sponsor.twitterUsername && (
															<p className="text-sm text-muted-foreground">
																@{sponsor.twitterUsername}
															</p>
														)}
													</div>
												</div>
												{sponsor.sponsorBudgetMin && (
													<p className="text-sm font-semibold mb-2">
														Budget: ${sponsor.sponsorBudgetMin}-$
														{sponsor.sponsorBudgetMax}/week
													</p>
												)}
												{sponsor.sponsorLookingFor && (
													<p className="text-sm text-muted-foreground line-clamp-3 mb-4">
														{sponsor.sponsorLookingFor}
													</p>
												)}
												<Button
													onClick={() =>
														router.push(`/sponsor/${sponsor.twitterUsername}`)
													}
													className="w-full"
													variant="outline"
												>
													View Profile
												</Button>
											</Card>
										))}
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</main>

			{/* Footer CTA */}
			{!session && (creators.length > 0 || sponsors.length > 0) && (
				<div className="border-t bg-muted">
					<div className="container mx-auto px-4 py-12 text-center">
						<h3 className="text-2xl font-bold mb-4">
							Ready to {activeTab === "creators" ? "monetize your Twitter banner" : "sponsor creators"}?
						</h3>
						<p className="text-muted-foreground mb-6">
							Join {activeTab === "creators" ? creators.length : sponsors.length}{" "}
							{activeTab === "creators"
								? creators.length === 1
									? "creator"
									: "creators"
								: sponsors.length === 1
									? "sponsor"
									: "sponsors"}{" "}
							already on the platform
						</p>
						<Button
							onClick={() => router.push("/login")}
							size="lg"
							className="font-semibold"
						>
							Sign in with Twitter / X
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
