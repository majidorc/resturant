"use client";

import { signOutAction } from "@/lib/actions/session";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/components/LocaleProvider";

export function SignOutButton() {
  const dict = useDictionary();

  return (
    <form action={signOutAction}>
      <Button className="w-full" type="submit" variant="secondary">
        {dict.common.signOut}
      </Button>
    </form>
  );
}
