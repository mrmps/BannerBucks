"use client";

import { UserCard } from "@/components/user-card";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { client, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function HomePage() {
	const { data: session } = authClient.useSession();
	const router = useRouter();

	// Fetch all users using ORPC
	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	// Auto-sync Twitter data when user logs in
	const syncMutation = useMutation({
		mutationFn: () => client.twitter.sync({}),
		onSuccess: () => {
			// Invalidate and refetch users after sync
			queryClient.invalidateQueries({ queryKey: ["users.getAll"] });
		},
	});

	// Trigger sync on mount if logged in and not already synced
	const currentUser = users.find((u: { id: string; twitterId: string | null }) => u.id === session?.user?.id);
	const needsSync = session?.user && !currentUser?.twitterId;

	if (needsSync && !syncMutation.isPending) {
		syncMutation.mutate();
	}

	if (isLoading) {
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
			<main className="container mx-auto px-4 py-12">
				{users.length === 0 ? (
					<div className="text-center py-20">
						<h2 className="text-2xl font-bold mb-4">No users yet</h2>
						<p className="text-muted-foreground mb-8">
							Be the first to sign in and showcase your Twitter profile!
						</p>
						<Button
							onClick={() => router.push("/login")}
							size="lg"
							className="font-semibold"
						>
							Sign in with Twitter / X
						</Button>
					</div>
				) : (
					<div>
						<h2 className="text-2xl font-bold mb-8">
							Connected Creators ({users.length})
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{users.map((user: any) => (
								<UserCard key={user.id} user={user} />
							))}
						</div>
					</div>
				)}
			</main>

			{/* Footer CTA */}
			{!session && users.length > 0 && (
				<div className="border-t bg-muted">
					<div className="container mx-auto px-4 py-12 text-center">
						<h3 className="text-2xl font-bold mb-4">
							Ready to monetize your Twitter banner?
						</h3>
						<p className="text-muted-foreground mb-6">
							Join {users.length} {users.length === 1 ? "creator" : "creators"}{" "}
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
