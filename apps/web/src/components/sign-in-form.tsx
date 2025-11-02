"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function SignInForm() {
  const { isPending } = authClient.useSession();
  const searchParams = useSearchParams();

  // Derive error info directly from search params
  const errorInfo = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) {
      return null;
    }

    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });

    return {
      code: error,
      description:
        searchParams.get("error_description") || "No description provided",
      allParams,
      timestamp: new Date().toISOString(),
    };
  }, [searchParams]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md space-y-6 p-6">
      <div>
        <h1 className="mb-6 text-center font-bold text-3xl">Welcome</h1>
        <p className="mb-6 text-center text-muted-foreground">
          Sign in to continue to your account
        </p>
      </div>

      {errorInfo && (
        <Card className="border-destructive bg-destructive/10 p-6">
          <h3 className="mb-3 font-bold text-destructive text-lg">
            ❌ Authentication Failed
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Error Code:</span>
              <code className="ml-2 rounded bg-black/10 px-2 py-1 dark:bg-white/10">
                {errorInfo.code}
              </code>
            </div>

            <div>
              <span className="font-semibold">Description:</span>
              <p className="mt-1 text-muted-foreground">
                {errorInfo.description}
              </p>
            </div>

            <details className="mt-4">
              <summary className="mb-2 cursor-pointer font-semibold hover:underline">
                🔍 Full Error Details (for debugging)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-black/5 p-3 text-xs dark:bg-white/5">
                {JSON.stringify(errorInfo, null, 2)}
              </pre>
            </details>

            <div className="mt-4 border-t pt-4">
              <p className="mb-2 font-semibold">💡 Common Solutions:</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground text-xs">
                <li>
                  <strong>App not in a Project:</strong> Twitter app must be
                  created inside a Project (not standalone)
                </li>
                <li>
                  <strong>OAuth 2.0:</strong> Ensure OAuth 2.0 is enabled in
                  Twitter Developer Portal
                </li>
                <li>
                  <strong>Callback URL:</strong> Must match exactly:{" "}
                  <code className="bg-black/10 px-1 dark:bg-white/10">
                    http://localhost:3001/api/auth/callback/twitter
                  </code>
                </li>
                <li>
                  <strong>App Permissions:</strong> Set to "Read" in User
                  authentication settings
                </li>
                <li>
                  <strong>Scopes:</strong> Check that your app has the required
                  OAuth scopes
                </li>
              </ul>
            </div>

            <div className="mt-4 border-t pt-4 text-xs">
              <p className="mb-1 font-semibold">📋 How to Fix:</p>
              <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    className="text-primary underline"
                    href="https://developer.twitter.com/en/portal/dashboard"
                    rel="noopener"
                    target="_blank"
                  >
                    Twitter Developer Portal
                  </a>
                </li>
                <li>Create a Project (if you don't have one)</li>
                <li>Add your app to the Project</li>
                <li>Configure User authentication settings with OAuth 2.0</li>
                <li>Try signing in again</li>
              </ol>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => window.history.replaceState({}, "", "/login")}
              size="sm"
              variant="outline"
            >
              Dismiss Error
            </Button>
          </div>
        </Card>
      )}

      <Button
        className="w-full"
        onClick={() => authClient.signIn.social({ provider: "twitter" })}
        variant="outline"
      >
        Continue with Twitter / X
      </Button>
    </div>
  );
}
