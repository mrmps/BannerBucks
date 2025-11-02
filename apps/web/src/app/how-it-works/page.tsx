"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <h1 className="font-bold text-2xl">How It Works</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            ← Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-5xl">
            Turn Your Twitter Banner Into Revenue
          </h2>
          <p className="text-muted-foreground text-xl">
            Connect creators with sponsors for profile banner advertising
          </p>
        </div>

        {/* For Creators */}
        <section className="mb-16">
          <h3 className="mb-8 text-center font-bold text-3xl">
            💰 For Creators
          </h3>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">1️⃣</div>
              <h4 className="mb-2 font-bold">Sign In</h4>
              <p className="text-muted-foreground text-sm">
                Connect with Twitter in one click
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">2️⃣</div>
              <h4 className="mb-2 font-bold">Set Preferences</h4>
              <p className="text-muted-foreground text-sm">
                Choose your price range and sponsor categories
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">3️⃣</div>
              <h4 className="mb-2 font-bold">Get Discovered</h4>
              <p className="text-muted-foreground text-sm">
                Appear in our directory for sponsors to find
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">4️⃣</div>
              <h4 className="mb-2 font-bold">Get Paid</h4>
              <p className="text-muted-foreground text-sm">
                Receive payments for banner sponsorships
              </p>
            </Card>
          </div>
        </section>

        {/* For Sponsors */}
        <section className="mb-16">
          <h3 className="mb-8 text-center font-bold text-3xl">
            📢 For Sponsors
          </h3>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">1️⃣</div>
              <h4 className="mb-2 font-bold">Browse</h4>
              <p className="text-muted-foreground text-sm">
                Find creators by audience size and category
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">2️⃣</div>
              <h4 className="mb-2 font-bold">Filter</h4>
              <p className="text-muted-foreground text-sm">
                Use filters to find your perfect match
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">3️⃣</div>
              <h4 className="mb-2 font-bold">Contact</h4>
              <p className="text-muted-foreground text-sm">
                Reach out directly via Twitter or email
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="mb-4 text-4xl">4️⃣</div>
              <h4 className="mb-2 font-bold">Advertise</h4>
              <p className="text-muted-foreground text-sm">
                Get your banner on their profile
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h3 className="mb-8 text-center font-bold text-3xl">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="mb-2 font-bold">
                How are profile visits calculated?
              </h4>
              <p className="text-muted-foreground text-sm">
                We use a proven algorithm based on follower count (1.67x
                multiplier), verified status, and engagement metrics. The
                formula has been validated against real Twitter analytics data.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 font-bold">How do banner updates work?</h4>
              <p className="text-muted-foreground text-sm">
                For now, creators manually update their banners. When payments
                launch, we'll offer automated banner updates (requires
                additional permissions).
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 font-bold">
                When will payments be available?
              </h4>
              <p className="text-muted-foreground text-sm">
                Payment processing via Stripe will launch in 2 weeks! For now,
                you can browse the directory and make direct contact to
                negotiate deals.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 font-bold">What are the platform fees?</h4>
              <p className="text-muted-foreground text-sm">
                We charge a 10% platform fee on transactions. Stripe payment
                processing fees (2.9% + $0.30) are passed to sponsors.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="mb-2 font-bold">Can I change my prices?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! You can update your price range, categories, and
                preferences anytime from your settings page.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-primary/5 p-12">
            <h3 className="mb-4 font-bold text-3xl">Ready to Get Started?</h3>
            <p className="mb-8 text-muted-foreground text-xl">
              Join our community of creators and sponsors today
            </p>
            <Button
              className="font-semibold"
              onClick={() => router.push("/login")}
              size="lg"
            >
              Sign in with Twitter / X
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
