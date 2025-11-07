import {
  account as generatedAccount,
  session as generatedSession,
  users as generatedUsers,
  verification as generatedVerification,
} from "./auth.generated";

// Re-export generated tables through stable symbols to avoid depending on the raw CLI output everywhere.
export const users = generatedUsers;
export const session = generatedSession;
export const account = generatedAccount;
export const verification = generatedVerification;
