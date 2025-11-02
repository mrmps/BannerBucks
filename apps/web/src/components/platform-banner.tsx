"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function PlatformBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="font-medium text-sm md:text-base">
            <strong>Payments launching in 2 weeks!</strong> Join now to be first
            in line.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="hidden md:inline-flex"
            onClick={() => {
              window.location.href = "/how-it-works";
            }}
            size="sm"
            variant="secondary"
          >
            Learn More
          </Button>
          <button
            aria-label="Dismiss"
            className="text-primary-foreground hover:opacity-75"
            onClick={() => setDismissed(true)}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
