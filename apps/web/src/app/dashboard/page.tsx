"use client";

import { authClient } from "@/lib/auth-client";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { SyncTwitterButton } from "@/components/sync-twitter-button";

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	// Fetch all users using ORPC
	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	// Find current user's data
	const userData = users.find((u) => u.id === session?.user?.id);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	// Redirect if not logged in
	if (!isPending && !session) {
		router.push("/login");
		return null;
	}

	if (isPending || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

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
				<div className="max-w-md mx-auto">
					<h2 className="text-2xl font-bold mb-6">Your Profile</h2>
					{userData ? (
						<UserCard user={userData} />
					) : (
						<div className="text-center py-8">
							<Loader />
							<p className="mt-4 text-muted-foreground">Loading your profile...</p>
						</div>
					)}

					<div className="mt-8 p-6 border rounded-lg">
						<h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Estimated banner views</li>
							<li>• Available campaigns</li>
							<li>• Earnings tracking</li>
							<li>• Banner management</li>
						</ul>
					</div>
				</div>
			</main>
		</div>
	);
}
