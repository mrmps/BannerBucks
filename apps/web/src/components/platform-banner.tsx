"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function PlatformBanner() {
	const [dismissed, setDismissed] = useState(false);

	if (dismissed) return null;

	return (
		<div className="bg-primary text-primary-foreground">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-lg">⚠️</span>
					<p className="text-sm md:text-base font-medium">
						<strong>Payments launching in 2 weeks!</strong> Join now to be first in line.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => (window.location.href = "/how-it-works")}
						className="hidden md:inline-flex"
					>
						Learn More
					</Button>
					<button
						onClick={() => setDismissed(true)}
						className="text-primary-foreground hover:opacity-75"
						aria-label="Dismiss"
					>
						✕
					</button>
				</div>
			</div>
		</div>
	);
}

