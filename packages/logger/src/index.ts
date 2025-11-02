import pino from "pino";

// Check if we're running with Bun or Node.js
// Use globalThis to safely check for Bun without TypeScript errors
const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

// Only use pino-pretty transport if:
// 1. We're in development, AND
// 2. We're running with Bun (to avoid thread-stream issues with Node.js)
const shouldUsePrettyTransport = isDev && isBun;

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: shouldUsePrettyTransport
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
