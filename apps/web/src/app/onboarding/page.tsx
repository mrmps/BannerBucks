"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { client, queryClient } from "@/utils/orpc";

export default function OnboardingPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "creator" | "sponsor" | "both" | null
  >(null);

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
  if (!(isPending || session)) {
    router.push("/login");
    return null;
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-4xl">
            Welcome to Monetize Banner! 👋
          </h1>
          <p className="text-muted-foreground text-xl">
            Let's get you set up. How will you use the platform?
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Creator Option */}
          <Card
            className={`cursor-pointer p-6 transition-all ${
              selectedRole === "creator"
                ? "border-2 border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("creator")}
          >
            <div className="text-center">
              <div className="mb-4 text-5xl">💰</div>
              <h2 className="mb-2 font-bold text-2xl">I'm a Creator</h2>
              <p className="mb-4 text-muted-foreground">
                Monetize my Twitter banner by connecting with sponsors
              </p>
              <ul className="space-y-2 text-left text-sm">
                <li>✅ Set your own pricing</li>
                <li>✅ Choose your sponsors</li>
                <li>✅ Get discovered</li>
                <li>✅ Track earnings</li>
              </ul>
            </div>
          </Card>

          {/* Sponsor Option */}
          <Card
            className={`cursor-pointer p-6 transition-all ${
              selectedRole === "sponsor"
                ? "border-2 border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("sponsor")}
          >
            <div className="text-center">
              <div className="mb-4 text-5xl">📢</div>
              <h2 className="mb-2 font-bold text-2xl">I'm a Sponsor</h2>
              <p className="mb-4 text-muted-foreground">
                Advertise on Twitter banners and reach targeted audiences
              </p>
              <ul className="space-y-2 text-left text-sm">
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
          className={`mb-6 cursor-pointer p-4 transition-all ${
            selectedRole === "both"
              ? "border-2 border-primary bg-primary/5"
              : "hover:border-primary/50"
          }`}
          onClick={() => setSelectedRole("both")}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="text-3xl">🔄</div>
            <div>
              <h3 className="font-bold">I'm Both</h3>
              <p className="text-muted-foreground text-sm">
                I want to be sponsored AND sponsor others
              </p>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <Button
          className="w-full"
          disabled={!selectedRole || setRoleMutation.isPending}
          onClick={() => selectedRole && setRoleMutation.mutate(selectedRole)}
          size="lg"
        >
          {(() => {
            if (setRoleMutation.isPending) {
              return "Setting up...";
            }
            if (!selectedRole) {
              return "Select an option to continue";
            }
            const roleLabel =
              selectedRole === "both"
                ? "Both"
                : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
            return `Continue as ${roleLabel}`;
          })()}
        </Button>

        <p className="mt-4 text-center text-muted-foreground text-sm">
          You can change this later in your settings
        </p>
      </div>
    </div>
  );
}
