"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function HowItWorksPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold">How It Works</h1>
					<Button variant="outline" onClick={() => router.push("/")}>
						← Back to Home
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-12 max-w-4xl">
				{/* Hero */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold mb-4">
						Turn Your Twitter Banner Into Revenue
					</h2>
					<p className="text-xl text-muted-foreground">
						Connect creators with sponsors for profile banner advertising
					</p>
				</div>

				{/* For Creators */}
				<section className="mb-16">
					<h3 className="text-3xl font-bold mb-8 text-center">
						💰 For Creators
					</h3>
					<div className="grid md:grid-cols-4 gap-6">
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">1️⃣</div>
							<h4 className="font-bold mb-2">Sign In</h4>
							<p className="text-sm text-muted-foreground">
								Connect with Twitter in one click
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">2️⃣</div>
							<h4 className="font-bold mb-2">Set Preferences</h4>
							<p className="text-sm text-muted-foreground">
								Choose your price range and sponsor categories
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">3️⃣</div>
							<h4 className="font-bold mb-2">Get Discovered</h4>
							<p className="text-sm text-muted-foreground">
								Appear in our directory for sponsors to find
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">4️⃣</div>
							<h4 className="font-bold mb-2">Get Paid</h4>
							<p className="text-sm text-muted-foreground">
								Receive payments for banner sponsorships
							</p>
						</Card>
					</div>
				</section>

				{/* For Sponsors */}
				<section className="mb-16">
					<h3 className="text-3xl font-bold mb-8 text-center">
						📢 For Sponsors
					</h3>
					<div className="grid md:grid-cols-4 gap-6">
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">1️⃣</div>
							<h4 className="font-bold mb-2">Browse</h4>
							<p className="text-sm text-muted-foreground">
								Find creators by audience size and category
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">2️⃣</div>
							<h4 className="font-bold mb-2">Filter</h4>
							<p className="text-sm text-muted-foreground">
								Use filters to find your perfect match
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">3️⃣</div>
							<h4 className="font-bold mb-2">Contact</h4>
							<p className="text-sm text-muted-foreground">
								Reach out directly via Twitter or email
							</p>
						</Card>
						<Card className="p-6 text-center">
							<div className="text-4xl mb-4">4️⃣</div>
							<h4 className="font-bold mb-2">Advertise</h4>
							<p className="text-sm text-muted-foreground">
								Get your banner on their profile
							</p>
						</Card>
					</div>
				</section>

				{/* FAQ */}
				<section className="mb-16">
					<h3 className="text-3xl font-bold mb-8 text-center">
						Frequently Asked Questions
					</h3>
					<div className="space-y-4">
						<Card className="p-6">
							<h4 className="font-bold mb-2">How are profile visits calculated?</h4>
							<p className="text-sm text-muted-foreground">
								We use a proven algorithm based on follower count (1.67x multiplier), verified status, 
								and engagement metrics. The formula has been validated against real Twitter analytics data.
							</p>
						</Card>
						<Card className="p-6">
							<h4 className="font-bold mb-2">How do banner updates work?</h4>
							<p className="text-sm text-muted-foreground">
								For now, creators manually update their banners. When payments launch, we'll offer 
								automated banner updates (requires additional permissions).
							</p>
						</Card>
						<Card className="p-6">
							<h4 className="font-bold mb-2">When will payments be available?</h4>
							<p className="text-sm text-muted-foreground">
								Payment processing via Stripe will launch in 2 weeks! For now, you can browse the 
								directory and make direct contact to negotiate deals.
							</p>
						</Card>
						<Card className="p-6">
							<h4 className="font-bold mb-2">What are the platform fees?</h4>
							<p className="text-sm text-muted-foreground">
								We charge a 10% platform fee on transactions. Stripe payment processing fees 
								(2.9% + $0.30) are passed to sponsors.
							</p>
						</Card>
						<Card className="p-6">
							<h4 className="font-bold mb-2">Can I change my prices?</h4>
							<p className="text-sm text-muted-foreground">
								Yes! You can update your price range, categories, and preferences anytime from your settings page.
							</p>
						</Card>
					</div>
				</section>

				{/* CTA */}
				<div className="text-center">
					<Card className="p-12 bg-primary/5">
						<h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
						<p className="text-xl text-muted-foreground mb-8">
							Join our community of creators and sponsors today
						</p>
						<Button
							size="lg"
							onClick={() => router.push("/login")}
							className="font-semibold"
						>
							Sign in with Twitter / X
						</Button>
					</Card>
				</div>
			</main>
		</div>
	);
}

