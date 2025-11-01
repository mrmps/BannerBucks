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

export default function SponsorProfilePage() {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;

	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	const sponsor = users.find(
		(u: any) => u.twitterUsername?.toLowerCase() === username.toLowerCase()
	);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	if (!sponsor || !sponsor.sponsorStatus) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="p-12 text-center max-w-md">
					<h2 className="text-2xl font-bold mb-4">Sponsor not found</h2>
					<p className="text-muted-foreground mb-6">
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

	const formatNumber = (num: number | null) => {
		if (!num) return "0";
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-muted/50">
				<div className="container mx-auto px-4 py-12">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-start gap-6">
							{/* Profile Picture */}
							{sponsor.image ? (
								<Image
									src={sponsor.image}
									alt={sponsor.name}
									width={120}
									height={120}
									className="rounded-full border-4 border-background"
								/>
							) : (
								<div className="w-30 h-30 rounded-full border-4 border-background bg-gray-200 flex items-center justify-center">
									<span className="text-3xl">{sponsor.name[0]}</span>
								</div>
							)}

							{/* Info */}
							<div className="flex-1">
								<div className="flex items-start justify-between">
									<div>
										<h1 className="text-4xl font-bold mb-2">
											{sponsor.sponsorCompanyName || sponsor.name}
										</h1>
										{sponsor.twitterUsername && (
											<p className="text-xl text-muted-foreground mb-2">
												@{sponsor.twitterUsername}
											</p>
										)}
										{sponsor.sponsorIndustry && (
											<Badge variant="secondary">{sponsor.sponsorIndustry}</Badge>
										)}
									</div>
									<Button
										size="lg"
										onClick={() =>
											window.open(
												`https://twitter.com/${sponsor.twitterUsername}`,
												"_blank"
											)
										}
									>
										View on Twitter
									</Button>
								</div>

								{sponsor.twitterBio && (
									<p className="mt-4 text-muted-foreground whitespace-pre-line">
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
				<div className="max-w-4xl mx-auto">
					<div className="grid md:grid-cols-3 gap-8">
						{/* Sidebar */}
						<div className="space-y-6">
							{/* Budget */}
							{sponsor.sponsorBudgetMin && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">💰 Budget Range</h3>
									<p className="text-2xl font-bold mb-1">
										${sponsor.sponsorBudgetMin}-${sponsor.sponsorBudgetMax}
									</p>
									<p className="text-sm text-muted-foreground">per week</p>
								</Card>
							)}

							{/* Website */}
							{sponsor.sponsorCompanyWebsite && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">🌐 Website</h3>
									<Button
										variant="outline"
										className="w-full"
										onClick={() =>
											window.open(sponsor.sponsorCompanyWebsite, "_blank")
										}
									>
										Visit Website
									</Button>
								</Card>
							)}

							{/* Stats */}
							<Card className="p-6">
								<h3 className="font-semibold mb-3">📊 Twitter Stats</h3>
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
						<div className="md:col-span-2 space-y-6">
							{/* Looking For */}
							{sponsor.sponsorLookingFor && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">🎯 Looking For</h3>
									<p className="whitespace-pre-line">{sponsor.sponsorLookingFor}</p>
								</Card>
							)}

							{/* Categories */}
							{categories.length > 0 && (
								<Card className="p-6">
									<h3 className="font-semibold mb-3">📂 Interested Categories</h3>
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
							<Card className="p-6 bg-primary/5">
								<h3 className="font-semibold mb-3">
									Interested in working with {sponsor.sponsorCompanyName || sponsor.name}?
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
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

