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

// Pricing suggestion constants
const FOLLOWERS_DISPLAY_DIVISOR = 1000;
const PRICE_MIN_MULTIPLIER = 0.1;
const PRICE_MAX_MULTIPLIER = 0.25;

export default function CreatorSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Fetch current user data
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users.getAll"],
    queryFn: () => client.users.getAll({}),
  });

  const currentUser = users.find((u) => u.id === session?.user?.id);

  const [status, setStatus] = useState<"available" | "unavailable" | "hidden">(
    (currentUser?.creatorStatus as "available" | "unavailable" | "hidden") ||
      "available"
  );
  const [priceMin, setPriceMin] = useState(currentUser?.creatorPriceMin || "");
  const [priceMax, setPriceMax] = useState(currentUser?.creatorPriceMax || "");
  const [lookingFor, setLookingFor] = useState(
    currentUser?.creatorLookingFor || ""
  );
  const [contactMethod, setContactMethod] = useState<
    "twitter" | "email" | "other"
  >(
    (currentUser?.creatorContactMethod as "twitter" | "email" | "other") ||
      "twitter"
  );
  const [contactValue, setContactValue] = useState(
    currentUser?.creatorContactValue || currentUser?.twitterUsername || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.creatorCategories
      ? JSON.parse(currentUser.creatorCategories)
      : []
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      client.users.updateCreatorSettings({
        status,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
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
          <h1 className="font-bold text-3xl">Creator Settings</h1>
          <p className="text-muted-foreground">
            Set up your sponsorship preferences
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="space-y-8 p-6">
          {/* Status */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              Availability Status
            </Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "available"}
                  className="h-4 w-4"
                  name="status"
                  onChange={(_e) => setStatus("available")}
                  type="radio"
                  value="available"
                />
                <div>
                  <p className="font-medium">🟢 Available</p>
                  <p className="text-muted-foreground text-sm">
                    Actively looking for sponsors
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "unavailable"}
                  className="h-4 w-4"
                  name="status"
                  onChange={(_e) => setStatus("unavailable")}
                  type="radio"
                  value="unavailable"
                />
                <div>
                  <p className="font-medium">🟡 Unavailable</p>
                  <p className="text-muted-foreground text-sm">
                    Not looking right now
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                <input
                  checked={status === "hidden"}
                  className="h-4 w-4"
                  name="status"
                  onChange={(_e) => setStatus("hidden")}
                  type="radio"
                  value="hidden"
                />
                <div>
                  <p className="font-medium">⚫ Hidden</p>
                  <p className="text-muted-foreground text-sm">
                    Don't show in directory
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              Price Range (per week)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm" htmlFor="priceMin">
                  Minimum ($)
                </Label>
                <Input
                  className="mt-1"
                  id="priceMin"
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="500"
                  type="number"
                  value={priceMin}
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="priceMax">
                  Maximum ($)
                </Label>
                <Input
                  className="mt-1"
                  id="priceMax"
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="1000"
                  type="number"
                  value={priceMax}
                />
              </div>
            </div>
            {currentUser?.twitterFollowers && (
              <p className="mt-2 text-muted-foreground text-sm">
                Suggested based on your{" "}
                {(
                  currentUser.twitterFollowers / FOLLOWERS_DISPLAY_DIVISOR
                ).toFixed(1)}
                K followers: $
                {Math.round(
                  currentUser.twitterFollowers * PRICE_MIN_MULTIPLIER
                )}
                -$
                {Math.round(
                  currentUser.twitterFollowers * PRICE_MAX_MULTIPLIER
                )}
                /week
              </p>
            )}
          </div>

          {/* Categories */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              Categories (select all that apply)
            </Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-accent"
                  htmlFor={`category-${cat.value}`}
                  key={cat.value}
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat.value)}
                    id={`category-${cat.value}`}
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
              Looking For
            </Label>
            <textarea
              className="min-h-32 w-full resize-y rounded-lg border p-3"
              id="lookingFor"
              maxLength={500}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder="Tell potential sponsors what you're looking for. E.g., 'Looking for tech companies, SaaS products, or developer tools that align with my audience of software engineers.'"
              value={lookingFor}
            />
            <p className="mt-1 text-muted-foreground text-sm">
              {lookingFor.length}/500 characters
            </p>
          </div>

          {/* Contact Method */}
          <div>
            <Label className="mb-4 block font-semibold text-lg">
              How should sponsors contact you?
            </Label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  checked={contactMethod === "twitter"}
                  className="h-4 w-4"
                  name="contactMethod"
                  onChange={() => setContactMethod("twitter")}
                  type="radio"
                  value="twitter"
                />
                <div className="flex-1">
                  <Label>Twitter DM</Label>
                  <Input
                    className="mt-1"
                    disabled={contactMethod !== "twitter"}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="@username"
                    value={contactMethod === "twitter" ? contactValue : ""}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  checked={contactMethod === "email"}
                  className="h-4 w-4"
                  name="contactMethod"
                  onChange={() => setContactMethod("email")}
                  type="radio"
                  value="email"
                />
                <div className="flex-1">
                  <Label>Email</Label>
                  <Input
                    className="mt-1"
                    disabled={contactMethod !== "email"}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="your@email.com"
                    type="email"
                    value={contactMethod === "email" ? contactValue : ""}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  checked={contactMethod === "other"}
                  className="h-4 w-4"
                  name="contactMethod"
                  onChange={() => setContactMethod("other")}
                  type="radio"
                  value="other"
                />
                <div className="flex-1">
                  <Label>Other</Label>
                  <Input
                    className="mt-1"
                    disabled={contactMethod !== "other"}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="Discord, Telegram, etc."
                    value={contactMethod === "other" ? contactValue : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              disabled={saveMutation.isPending}
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
