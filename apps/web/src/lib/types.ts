import type { AppRouterClient } from "@banner-money/api/routers/index";

// Infer user type from the API response
export type User = Awaited<
  ReturnType<AppRouterClient["users"]["getAll"]>
>[number];
