"use client";

import { Button } from "@/components/ui/button";
import { client, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function SyncTwitterButton() {
	const syncMutation = useMutation({
		mutationFn: () => client.twitter.sync({}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users.getAll"] });
			toast.success("Twitter data synced successfully!");
		},
		onError: (error) => {
			toast.error(`Failed to sync: ${error.message}`);
		},
	});

	return (
		<Button
			onClick={() => syncMutation.mutate()}
			disabled={syncMutation.isPending}
			variant="outline"
		>
			{syncMutation.isPending ? "Syncing..." : "🔄 Sync Twitter Data"}
		</Button>
	);
}

