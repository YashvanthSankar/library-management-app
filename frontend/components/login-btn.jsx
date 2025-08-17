"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          Logged in as {session.user.name || session.user.email}
        </span>
        <Button 
          onClick={() => signOut()} 
          variant="outline"
          size="sm"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => signIn()} 
      className="bg-black text-white dark:bg-white dark:text-black"
    >
      Login
    </Button>
  );
}
