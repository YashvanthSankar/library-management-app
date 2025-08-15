"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login() {
  const [role, setRole] = useState("borrower"); // borrower | librarian
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      role,
      email: formData.get("email"),
      password: formData.get("password"),
    };
    // TODO: replace with real API call
    setLoading(true);
    console.log("LOGIN_ATTEMPT", payload);
    setTimeout(() => setLoading(false), 800);
  }

  const isLibrarian = role === "librarian";

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black dark:bg-black dark:text-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {isLibrarian ? "Librarian Login" : "Borrower Login"}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isLibrarian ? "outline" : "default"}
              className={!isLibrarian ? "bg-black text-white dark:bg-white dark:text-black" : ""}
              onClick={() => setRole("borrower")}
            >
              Borrower
            </Button>
            <Button
              type="button"
              variant={isLibrarian ? "default" : "outline"}
              className={isLibrarian ? "bg-black text-white dark:bg-white dark:text-black" : ""}
              onClick={() => setRole("librarian")}
            >
              Librarian
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="role" value={role} />
            <div className="grid gap-2">
              <Label htmlFor="email">{isLibrarian ? "Work Email" : "Email"}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={isLibrarian ? "librarian@library.org" : "you@example.com"}
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs underline hover:no-underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={isLibrarian ? "current-password" : "new-password"}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white dark:bg-white dark:text-black"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
       <CardFooter className="flex-col gap-2 text-xs text-muted-foreground">
          <p className="text-center w-full">
            Don't have an account? {" "}
            <Link href="/signup" className="underline hover:no-underline">Sign Up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
