"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { client, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { useState } from "react";

export default function OnboardingPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<"creator" | "sponsor" | "both" | null>(null);

	const setRoleMutation = useMutation({
		mutationFn: (role: "creator" | "sponsor" | "both") =>
			client.users.setRole({ role }),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["users.getAll"] });
			toast.success("Welcome! Let's set up your profile.");
			
			// Redirect based on role
			if (data.role === "creator") {
				router.push("/dashboard/settings?setup=true");
			} else if (data.role === "sponsor") {
				router.push("/sponsor/settings?setup=true");
			} else {
				router.push("/dashboard/settings?setup=true");
			}
		},
		onError: (error) => {
			toast.error(`Error: ${error.message}`);
		},
	});

	// Redirect if already onboarded
	if (!isPending && !session) {
		router.push("/login");
		return null;
	}

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4">Welcome to Monetize Banner! 👋</h1>
					<p className="text-xl text-muted-foreground">
						Let's get you set up. How will you use the platform?
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6 mb-8">
					{/* Creator Option */}
					<Card
						className={`p-6 cursor-pointer transition-all ${
							selectedRole === "creator"
								? "border-primary border-2 bg-primary/5"
								: "hover:border-primary/50"
						}`}
						onClick={() => setSelectedRole("creator")}
					>
						<div className="text-center">
							<div className="text-5xl mb-4">💰</div>
							<h2 className="text-2xl font-bold mb-2">I'm a Creator</h2>
							<p className="text-muted-foreground mb-4">
								Monetize my Twitter banner by connecting with sponsors
							</p>
							<ul className="text-sm text-left space-y-2">
								<li>✅ Set your own pricing</li>
								<li>✅ Choose your sponsors</li>
								<li>✅ Get discovered</li>
								<li>✅ Track earnings</li>
							</ul>
						</div>
					</Card>

					{/* Sponsor Option */}
					<Card
						className={`p-6 cursor-pointer transition-all ${
							selectedRole === "sponsor"
								? "border-primary border-2 bg-primary/5"
								: "hover:border-primary/50"
						}`}
						onClick={() => setSelectedRole("sponsor")}
					>
						<div className="text-center">
							<div className="text-5xl mb-4">📢</div>
							<h2 className="text-2xl font-bold mb-2">I'm a Sponsor</h2>
							<p className="text-muted-foreground mb-4">
								Advertise on Twitter banners and reach targeted audiences
							</p>
							<ul className="text-sm text-left space-y-2">
								<li>✅ Browse verified creators</li>
								<li>✅ See real stats</li>
								<li>✅ Transparent pricing</li>
								<li>✅ Track ROI</li>
							</ul>
						</div>
					</Card>
				</div>

				{/* Both Option */}
				<Card
					className={`p-4 cursor-pointer transition-all mb-6 ${
						selectedRole === "both"
							? "border-primary border-2 bg-primary/5"
							: "hover:border-primary/50"
					}`}
					onClick={() => setSelectedRole("both")}
				>
					<div className="flex items-center justify-center gap-4">
						<div className="text-3xl">🔄</div>
						<div>
							<h3 className="font-bold">I'm Both</h3>
							<p className="text-sm text-muted-foreground">
								I want to be sponsored AND sponsor others
							</p>
						</div>
					</div>
				</Card>

				{/* Continue Button */}
				<Button
					onClick={() => selectedRole && setRoleMutation.mutate(selectedRole)}
					disabled={!selectedRole || setRoleMutation.isPending}
					size="lg"
					className="w-full"
				>
					{setRoleMutation.isPending
						? "Setting up..."
						: selectedRole
							? `Continue as ${selectedRole === "both" ? "Both" : selectedRole}`
							: "Select an option to continue"}
				</Button>

				<p className="text-center text-sm text-muted-foreground mt-4">
					You can change this later in your settings
				</p>
			</div>
		</div>
	);
}

