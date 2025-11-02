"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { client, queryClient } from "@/utils/orpc";

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
      disabled={syncMutation.isPending}
      onClick={() => syncMutation.mutate()}
      variant="outline"
    >
      {syncMutation.isPending ? "Syncing..." : "🔄 Sync Twitter Data"}
    </Button>
  );
}
