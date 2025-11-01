"use client";

import { useParams, useRouter } from "next/navigation";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";

export default function CreatorProfilePage() {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;

	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	const creator = users.find(
		(u: any) => u.twitterUsername?.toLowerCase() === username.toLowerCase()
	);

	const formatNumber = (num: number | null) => {
		if (!num) return "0";
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	// Calculate estimated visits
	const estimateMonthlyVisits = () => {
		if (!creator) return 0;
		const followers = creator.twitterFollowers || 0;
		const listed = creator.twitterListedCount || 0;
		const tweets = creator.twitterTweetCount || 0;

		let monthlyVisits = followers * 1.67;

		if (listed > 100) monthlyVisits *= 1.2;
		if (tweets > 10000) monthlyVisits *= 1.1;
		if (creator.twitterVerified || creator.twitterVerifiedType) {
			monthlyVisits *= 1.15;
		}

		return Math.round(monthlyVisits);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	if (!creator) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="p-12 text-center max-w-md">
					<h2 className="text-2xl font-bold mb-4">Creator not found</h2>
					<p className="text-muted-foreground mb-6">
						This creator doesn't exist or isn't available for sponsorship.
					</p>
					<Button onClick={() => router.push("/")}>
						Back to Directory
					</Button>
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
			<div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-500">
				{creator.twitterBannerUrl && (
					<Image
						src={creator.twitterBannerUrl}
						alt="Profile banner"
						fill
						className="object-cover"
						priority
						unoptimized
					/>
				)}
			</div>

			{/* Profile Section */}
			<div className="container mx-auto px-4 -mt-20">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-end gap-6 mb-8">
						{/* Profile Picture */}
						<div className="relative">
							{creator.image ? (
								<Image
									src={creator.image}
									alt={creator.name}
									width={160}
									height={160}
									className="rounded-full border-4 border-background"
								/>
							) : (
								<div className="w-40 h-40 rounded-full border-4 border-background bg-gray-200 flex items-center justify-center">
									<span className="text-4xl">{creator.name[0]}</span>
								</div>
							)}
						</div>

						{/* Name & Actions */}
						<div className="flex-1 pb-4">
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-4xl font-bold flex items-center gap-2">
										{creator.name}
										{creator.twitterVerified && <Badge>✓ Verified</Badge>}
									</h1>
									{creator.twitterUsername && (
										<p className="text-xl text-muted-foreground">
											@{creator.twitterUsername}
										</p>
									)}
								</div>
								<Button
									size="lg"
									onClick={() =>
										router.push(`https://twitter.com/${creator.twitterUsername}`)
									}
								>
									Contact Creator
								</Button>
							</div>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-4 gap-4 mb-8">
						<Card className="p-4 text-center">
							<p className="text-3xl font-bold">{formatNumber(creator.twitterFollowers)}</p>
							<p className="text-sm text-muted-foreground">Followers</p>
						</Card>
						<Card className="p-4 text-center">
							<p className="text-3xl font-bold">{formatNumber(monthlyVisits)}</p>
							<p className="text-sm text-muted-foreground">Est. Visits/Month</p>
						</Card>
						<Card className="p-4 text-center">
							<p className="text-3xl font-bold">
								{formatNumber(creator.twitterVerifiedFollowers)}
							</p>
							<p className="text-sm text-muted-foreground">Verified Followers</p>
						</Card>
						<Card className="p-4 text-center">
							<p className="text-3xl font-bold">{formatNumber(creator.twitterTweetCount)}</p>
							<p className="text-sm text-muted-foreground">Tweets</p>
						</Card>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{/* Main Info */}
						<div className="md:col-span-2 space-y-6">
							{/* Bio */}
							{creator.twitterBio && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">About</h3>
									<p className="whitespace-pre-line">{creator.twitterBio}</p>
								</Card>
							)}

							{/* Looking For */}
							{creator.creatorLookingFor && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">Looking For</h3>
									<p className="whitespace-pre-line">{creator.creatorLookingFor}</p>
								</Card>
							)}

							{/* Categories */}
							{categories.length > 0 && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">Categories</h3>
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
									<h3 className="font-semibold mb-3">💰 Pricing</h3>
									<p className="text-2xl font-bold mb-1">
										${creator.creatorPriceMin}-${creator.creatorPriceMax}
									</p>
									<p className="text-sm text-muted-foreground">per week</p>
									<div className="mt-4 pt-4 border-t">
										<p className="text-sm text-muted-foreground mb-1">Est. CPM</p>
										<p className="font-semibold">
											$
											{Math.round(
												((creator.creatorPriceMin + creator.creatorPriceMax) / 2 / monthlyVisits) *
													1000
											)}-$
											{Math.round(
												((creator.creatorPriceMin + creator.creatorPriceMax) / 2 / monthlyVisits) *
													1000 * 1.5
											)}
										</p>
									</div>
								</Card>
							)}

							{/* Contact */}
							{creator.creatorContactMethod && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">📬 Contact</h3>
									{creator.creatorContactMethod === "twitter" && (
										<div>
											<p className="text-sm text-muted-foreground mb-2">Twitter DM</p>
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
											<p className="text-sm text-muted-foreground mb-2">Email</p>
											<Button
												className="w-full"
												onClick={() =>
													window.open(`mailto:${creator.creatorContactValue}`, "_blank")
												}
											>
												Send Email
											</Button>
										</div>
									)}
									{creator.creatorContactMethod === "other" && (
										<div>
											<p className="text-sm text-muted-foreground mb-2">Contact</p>
											<p className="font-mono text-sm">{creator.creatorContactValue}</p>
										</div>
									)}
								</Card>
							)}

							{/* Additional Info */}
							{creator.twitterLocation && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">📍 Location</h3>
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

