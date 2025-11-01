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

export default function SponsorSettingsPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	// Fetch current user data
	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users.getAll"],
		queryFn: () => client.users.getAll({}),
	});

	const currentUser = users.find((u: any) => u.id === session?.user?.id);

	const [status, setStatus] = useState<"active" | "inactive" | "hidden">(
		currentUser?.sponsorStatus || "active"
	);
	const [companyName, setCompanyName] = useState(currentUser?.sponsorCompanyName || "");
	const [companyWebsite, setCompanyWebsite] = useState(currentUser?.sponsorCompanyWebsite || "");
	const [industry, setIndustry] = useState(currentUser?.sponsorIndustry || "");
	const [budgetMin, setBudgetMin] = useState(currentUser?.sponsorBudgetMin || "");
	const [budgetMax, setBudgetMax] = useState(currentUser?.sponsorBudgetMax || "");
	const [lookingFor, setLookingFor] = useState(currentUser?.sponsorLookingFor || "");
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		currentUser?.sponsorCategories ? JSON.parse(currentUser.sponsorCategories) : []
	);

	const saveMutation = useMutation({
		mutationFn: () =>
			client.users.updateSponsorSettings({
				status,
				companyName: companyName || undefined,
				companyWebsite: companyWebsite || undefined,
				industry: industry || undefined,
				categories: selectedCategories.length > 0 ? selectedCategories : undefined,
				budgetMin: budgetMin ? Number(budgetMin) : undefined,
				budgetMax: budgetMax ? Number(budgetMax) : undefined,
				lookingFor: lookingFor || undefined,
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
					<h1 className="text-3xl font-bold">Sponsor Settings</h1>
					<p className="text-muted-foreground">
						Set up your company profile and preferences
					</p>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-3xl">
				<Card className="p-6 space-y-8">
					{/* Company Info */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold block">
							Company Information
						</Label>
						<div>
							<Label htmlFor="companyName">Company Name *</Label>
							<Input
								id="companyName"
								placeholder="TechCorp Inc."
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="companyWebsite">Website</Label>
							<Input
								id="companyWebsite"
								type="url"
								placeholder="https://techcorp.com"
								value={companyWebsite}
								onChange={(e) => setCompanyWebsite(e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="industry">Industry</Label>
							<Input
								id="industry"
								placeholder="SaaS, FinTech, E-commerce, etc."
								value={industry}
								onChange={(e) => setIndustry(e.target.value)}
								className="mt-1"
							/>
						</div>
					</div>

					{/* Status */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							Sponsorship Status
						</Label>
						<div className="space-y-2">
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="active"
									checked={status === "active"}
									onChange={() => setStatus("active")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">🟢 Active</p>
									<p className="text-sm text-muted-foreground">
										Looking for creators to sponsor
									</p>
								</div>
							</label>
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="inactive"
									checked={status === "inactive"}
									onChange={() => setStatus("inactive")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">🟡 Inactive</p>
									<p className="text-sm text-muted-foreground">
										Not sponsoring right now
									</p>
								</div>
							</label>
							<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
								<input
									type="radio"
									name="status"
									value="hidden"
									checked={status === "hidden"}
									onChange={() => setStatus("hidden")}
									className="w-4 h-4"
								/>
								<div>
									<p className="font-medium">⚫ Hidden</p>
									<p className="text-sm text-muted-foreground">
										Don't show in sponsor directory
									</p>
								</div>
							</label>
						</div>
					</div>

					{/* Budget Range */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							Budget Range (per week)
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="budgetMin" className="text-sm">
									Minimum ($)
								</Label>
								<Input
									id="budgetMin"
									type="number"
									placeholder="500"
									value={budgetMin}
									onChange={(e) => setBudgetMin(e.target.value)}
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="budgetMax" className="text-sm">
									Maximum ($)
								</Label>
								<Input
									id="budgetMax"
									type="number"
									placeholder="2000"
									value={budgetMax}
									onChange={(e) => setBudgetMax(e.target.value)}
									className="mt-1"
								/>
							</div>
						</div>
					</div>

					{/* Categories */}
					<div>
						<Label className="text-lg font-semibold mb-4 block">
							What categories are you interested in?
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
							What type of creators are you looking for?
						</Label>
						<textarea
							id="lookingFor"
							placeholder="E.g., 'Looking for tech influencers with 10K-50K followers who focus on developer tools and SaaS products. Prefer verified accounts with high engagement rates.'"
							value={lookingFor}
							onChange={(e) => setLookingFor(e.target.value)}
							className="w-full min-h-32 p-3 border rounded-lg resize-y"
							maxLength={500}
						/>
						<p className="text-sm text-muted-foreground mt-1">
							{lookingFor.length}/500 characters
						</p>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<Button
							onClick={() => saveMutation.mutate()}
							disabled={saveMutation.isPending || !companyName}
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

