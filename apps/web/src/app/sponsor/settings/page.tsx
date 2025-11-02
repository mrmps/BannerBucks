"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { CATEGORIES } from "@/lib/categories";
import { client, queryClient } from "@/utils/orpc";

export default function SponsorSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Fetch current user data
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
  });

  const currentUser = users.find((u) => u.id === session?.user?.id);

  const [status, setStatus] = useState<"active" | "inactive" | "hidden">(
    (currentUser?.sponsorStatus as "active" | "inactive" | "hidden") || "active"
  );
  const [companyName, setCompanyName] = useState(
    currentUser?.sponsorCompanyName || ""
  );
  const [companyWebsite, setCompanyWebsite] = useState(
    currentUser?.sponsorCompanyWebsite || ""
  );
  const [industry, setIndustry] = useState(currentUser?.sponsorIndustry || "");
  const [budgetMin, setBudgetMin] = useState(
    currentUser?.sponsorBudgetMin || ""
  );
  const [budgetMax, setBudgetMax] = useState(
    currentUser?.sponsorBudgetMax || ""
  );
  const [lookingFor, setLookingFor] = useState(
    currentUser?.sponsorLookingFor || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.sponsorCategories
      ? JSON.parse(currentUser.sponsorCategories)
      : []
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      client.users.updateSponsorSettings({
        status,
        companyName: companyName || undefined,
        companyWebsite: companyWebsite || undefined,
        industry: industry || undefined,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
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

  if (!(isPending || session)) {
    router.push("/login");
    return null;
  }

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
          <h1 className="font-bold text-3xl">Sponsor Settings</h1>
          <p className="text-muted-foreground">
            Set up your company profile and preferences
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="space-y-8 p-6">
          {/* Company Info */}
          <div className="space-y-4">
            <Label className="block font-semibold text-lg">
              Company Information
            </Label>
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                className="mt-1"
                id="companyName"
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="TechCorp Inc."
                value={companyName}
              />
            </div>
            <div>
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                className="mt-1"
                id="companyWebsite"
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://techcorp.com"
                type="url"
                value={companyWebsite}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                className="mt-1"
                id="industry"
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="SaaS, FinTech, E-commerce, etc."
                value={industry}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              Sponsorship Status
            </Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "active"}
                  className="h-4 w-4"
                  name="status"
                  onChange={() => setStatus("active")}
                  type="radio"
                  value="active"
                />
                <div>
                  <p className="font-medium">🟢 Active</p>
                  <p className="text-muted-foreground text-sm">
                    Looking for creators to sponsor
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "inactive"}
                  className="h-4 w-4"
                  name="status"
                  onChange={() => setStatus("inactive")}
                  type="radio"
                  value="inactive"
                />
                <div>
                  <p className="font-medium">🟡 Inactive</p>
                  <p className="text-muted-foreground text-sm">
                    Not sponsoring right now
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "hidden"}
                  className="h-4 w-4"
                  name="status"
                  onChange={() => setStatus("hidden")}
                  type="radio"
                  value="hidden"
                />
                <div>
                  <p className="font-medium">⚫ Hidden</p>
                  <p className="text-muted-foreground text-sm">
                    Don't show in sponsor directory
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              Budget Range (per week)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm" htmlFor="budgetMin">
                  Minimum ($)
                </Label>
                <Input
                  className="mt-1"
                  id="budgetMin"
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="500"
                  type="number"
                  value={budgetMin}
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="budgetMax">
                  Maximum ($)
                </Label>
                <Input
                  className="mt-1"
                  id="budgetMax"
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="2000"
                  type="number"
                  value={budgetMax}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              What categories are you interested in?
            </Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-accent"
                  htmlFor={`sponsor-category-${cat.value}`}
                  key={cat.value}
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat.value)}
                    id={`sponsor-category-${cat.value}`}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <Label
              className="mb-2 block font-semibold text-lg"
              htmlFor="lookingFor"
            >
              What type of creators are you looking for?
            </Label>
            <textarea
              className="min-h-32 w-full resize-y rounded-lg border p-3"
              id="lookingFor"
              maxLength={500}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder="E.g., 'Looking for tech influencers with 10K-50K followers who focus on developer tools and SaaS products. Prefer verified accounts with high engagement rates.'"
              value={lookingFor}
            />
            <p className="mt-1 text-muted-foreground text-sm">
              {lookingFor.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              disabled={saveMutation.isPending || !companyName}
              onClick={() => saveMutation.mutate()}
              size="lg"
            >
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
