import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";

export default function SignUpForm() {
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto w-full mt-10 max-w-md p-6">
			<h1 className="mb-6 text-center text-3xl font-bold">Welcome</h1>
			<p className="mb-6 text-center text-muted-foreground">
				Sign in to continue to your account
			</p>

			<Button
				onClick={() => authClient.signIn.social({ provider: "twitter" })}
				variant="outline"
				className="w-full"
			>
				Continue with Twitter / X
			</Button>
		</div>
	);
}
