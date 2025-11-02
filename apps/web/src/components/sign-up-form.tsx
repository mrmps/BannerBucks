import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";

export default function SignUpForm() {
  const { isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center font-bold text-3xl">Welcome</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Sign in to continue to your account
      </p>

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
