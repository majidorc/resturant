import { signOutAction } from "@/lib/actions/session";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button className="w-full" type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  );
}
