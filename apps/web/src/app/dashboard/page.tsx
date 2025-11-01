"use client";

import { authClient } from "@/lib/auth-client";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { SyncTwitterButton } from "@/components/sync-twitter-button";
import { useQueryState, parseAsStringEnum } from "nuqs";

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	// URL-based tab state management with nuqs
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsStringEnum(["profile", "campaigns", "earnings", "settings"]).withDefault("profile")
	);

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
				<div className="max-w-4xl mx-auto">
					{/* Tab Navigation */}
					<div className="flex gap-2 mb-8 border-b">
						<Button
							variant="ghost"
							className={activeTab === "profile" ? "border-b-2 border-primary rounded-none" : "rounded-none"}
							onClick={() => setActiveTab("profile")}
						>
							Profile
						</Button>
						<Button
							variant="ghost"
							className={activeTab === "campaigns" ? "border-b-2 border-primary rounded-none" : "rounded-none"}
							onClick={() => setActiveTab("campaigns")}
						>
							Campaigns
						</Button>
						<Button
							variant="ghost"
							className={activeTab === "earnings" ? "border-b-2 border-primary rounded-none" : "rounded-none"}
							onClick={() => setActiveTab("earnings")}
						>
							Earnings
						</Button>
						<Button
							variant="ghost"
							className={activeTab === "settings" ? "border-b-2 border-primary rounded-none" : "rounded-none"}
							onClick={() => setActiveTab("settings")}
						>
							Settings
						</Button>
					</div>

					{/* Tab Content */}
					{activeTab === "profile" && (
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
						</div>
					)}

					{activeTab === "campaigns" && (
						<div className="p-6 border rounded-lg">
							<h3 className="text-lg font-semibold mb-4">Available Campaigns</h3>
							<p className="text-muted-foreground">
								Campaign marketplace coming soon. You'll be able to browse and apply for banner advertising campaigns.
							</p>
						</div>
					)}

					{activeTab === "earnings" && (
						<div className="p-6 border rounded-lg">
							<h3 className="text-lg font-semibold mb-4">Earnings</h3>
							<p className="text-muted-foreground">
								Track your earnings and payment history here. This feature is coming soon.
							</p>
						</div>
					)}

					{activeTab === "settings" && (
						<div className="p-6 border rounded-lg">
							<h3 className="text-lg font-semibold mb-4">Settings</h3>
							<p className="text-muted-foreground">
								Configure your banner preferences, notification settings, and more. Coming soon.
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
