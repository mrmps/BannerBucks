"use client";

import { Suspense } from "react";
import SignInForm from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-10 w-full max-w-md space-y-6 p-6 text-center">
          Loading...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
