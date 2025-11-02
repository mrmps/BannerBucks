import { logger } from "@banner-money/logger";
import { type NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");

  // Log the error details to server console
  logger.error(
    {
      error,
      errorDescription,
      state,
      url: req.url,
      searchParams: Object.fromEntries(searchParams.entries()),
    },
    "Better Auth Error"
  );

  // Redirect to login with error details
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", error || "unknown_error");
  if (errorDescription) {
    loginUrl.searchParams.set("error_description", errorDescription);
  }

  // Add all other params for debugging
  searchParams.forEach((value, key) => {
    if (key !== "error" && key !== "error_description") {
      loginUrl.searchParams.set(key, value);
    }
  });

  return NextResponse.redirect(loginUrl);
}
