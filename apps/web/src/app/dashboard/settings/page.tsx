"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { client, queryClient } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreatorSettingsPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	// Fetch current user data
	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	const currentUser = users.find((u: any) => u.id === session?.user?.id);

	const [status, setStatus] = useState<"available" | "unavailable" | "hidden">(
		currentUser?.creatorStatus || "available"
	);
	const [priceMin, setPriceMin] = useState(currentUser?.creatorPriceMin || "");
	const [priceMax, setPriceMax] = useState(currentUser?.creatorPriceMax || "");
	const [lookingFor, setLookingFor] = useState(currentUser?.creatorLookingFor || "");
	const [contactMethod, setContactMethod] = useState<"twitter" | "email" | "other">(
		currentUser?.creatorContactMethod || "twitter"
	);
	const [contactValue, setContactValue] = useState(
		currentUser?.creatorContactValue || currentUser?.twitterUsername || ""
	);
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		currentUser?.creatorCategories ? JSON.parse(currentUser.creatorCategories) : []
	);

	const saveMutation = useMutation({
		mutationFn: () =>
			client.users.updateCreatorSettings({
				status,
				priceMin: priceMin ? Number(priceMin) : undefined,
				priceMax: priceMax ? Number(priceMax) : undefined,
				categories: selectedCategories.length > 0 ? selectedCategories : undefined,
				lookingFor: lookingFor || undefined,
				contactMethod,
				contactValue: contactValue || undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users.getAll"] });
			toast.success("Settings saved successfully!");
			router.push("/dashboard");
		},
		onError: (error) => {
			toast.error(`Error: ${error.message}`);
		},
	});

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

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold">Creator Settings</h1>
					<p className="text-muted-foreground">
						Set up your sponsorship preferences
					</p>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-3xl">
				<Card className="p-6 space-y-8">
					{/* Status */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							Availability Status
						</Label>
						<div className="space-y-2">
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="available"
									checked={status === "available"}
									onChange={(e) => setStatus("available")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">🟢 Available</p>
									<p className="text-sm text-muted-foreground">
										Actively looking for sponsors
									</p>
								</div>
							</label>
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="unavailable"
									checked={status === "unavailable"}
									onChange={(e) => setStatus("unavailable")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">🟡 Unavailable</p>
									<p className="text-sm text-muted-foreground">
										Not looking right now
									</p>
								</div>
							</label>
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="hidden"
									checked={status === "hidden"}
									onChange={(e) => setStatus("hidden")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">⚫ Hidden</p>
									<p className="text-sm text-muted-foreground">
										Don't show in directory
									</p>
								</div>
							</label>
						</div>
					</div>

					{/* Price Range */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							Price Range (per week)
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="priceMin" className="text-sm">
									Minimum ($)
								</Label>
								<Input
									id="priceMin"
									type="number"
									placeholder="500"
									value={priceMin}
									onChange={(e) => setPriceMin(e.target.value)}
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="priceMax" className="text-sm">
									Maximum ($)
								</Label>
								<Input
									id="priceMax"
									type="number"
									placeholder="1000"
									value={priceMax}
									onChange={(e) => setPriceMax(e.target.value)}
									className="mt-1"
								/>
							</div>
						</div>
						{currentUser?.twitterFollowers && (
							<p className="text-sm text-muted-foreground mt-2">
								Suggested based on your {(currentUser.twitterFollowers / 1000).toFixed(1)}K followers: $
								{Math.round(currentUser.twitterFollowers * 0.1)}-$
								{Math.round(currentUser.twitterFollowers * 0.25)}/week
							</p>
						)}
					</div>

					{/* Categories */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							Categories (select all that apply)
						</Label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{CATEGORIES.map((cat) => (
								<label
									key={cat.value}
									className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent"
								>
									<Checkbox
										checked={selectedCategories.includes(cat.value)}
										onCheckedChange={() => toggleCategory(cat.value)}
									/>
									<span className="text-sm">{cat.label}</span>
								</label>
							))}
						</div>
					</div>

					{/* Looking For */}
					<div>
						<Label htmlFor="lookingFor" className="text-lg font-semibold mb-2 block">
							Looking For
						</Label>
						<textarea
							id="lookingFor"
							placeholder="Tell potential sponsors what you're looking for. E.g., 'Looking for tech companies, SaaS products, or developer tools that align with my audience of software engineers.'"
							value={lookingFor}
							onChange={(e) => setLookingFor(e.target.value)}
							className="w-full min-h-32 p-3 border rounded-lg resize-y"
							maxLength={500}
						/>
						<p className="text-sm text-muted-foreground mt-1">
							{lookingFor.length}/500 characters
						</p>
					</div>

					{/* Contact Method */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							How should sponsors contact you?
						</Label>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<input
									type="radio"
									name="contactMethod"
									value="twitter"
									checked={contactMethod === "twitter"}
									onChange={() => setContactMethod("twitter")}
									className="w-4 h-4"
								/>
								<div className="flex-1">
									<Label>Twitter DM</Label>
									<Input
										placeholder="@username"
										value={contactMethod === "twitter" ? contactValue : ""}
										onChange={(e) => setContactValue(e.target.value)}
										disabled={contactMethod !== "twitter"}
										className="mt-1"
									/>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<input
									type="radio"
									name="contactMethod"
									value="email"
									checked={contactMethod === "email"}
									onChange={() => setContactMethod("email")}
									className="w-4 h-4"
								/>
								<div className="flex-1">
									<Label>Email</Label>
									<Input
										type="email"
										placeholder="your@email.com"
										value={contactMethod === "email" ? contactValue : ""}
										onChange={(e) => setContactValue(e.target.value)}
										disabled={contactMethod !== "email"}
										className="mt-1"
									/>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<input
									type="radio"
									name="contactMethod"
									value="other"
									checked={contactMethod === "other"}
									onChange={() => setContactMethod("other")}
									className="w-4 h-4"
								/>
								<div className="flex-1">
									<Label>Other</Label>
									<Input
										placeholder="Discord, Telegram, etc."
										value={contactMethod === "other" ? contactValue : ""}
										onChange={(e) => setContactValue(e.target.value)}
										disabled={contactMethod !== "other"}
										className="mt-1"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<Button
							onClick={() => saveMutation.mutate()}
							disabled={saveMutation.isPending}
							className="flex-1"
							size="lg"
						>
							{saveMutation.isPending ? "Saving..." : "Save Settings"}
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push("/dashboard")}
							size="lg"
						>
							Cancel
						</Button>
					</div>
				</Card>
			</main>
		</div>
	);
}

