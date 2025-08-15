"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function SignUp() {
  const [role, setRole] = useState("borrower"); // borrower | librarian
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLibrarian = role === "librarian";

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirm = formData.get("confirmPassword");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    console.log("SIGNUP_ATTEMPT", payload);
    // TODO: replace with real signup API call
    setTimeout(() => setLoading(false), 900);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black dark:bg-black dark:text-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {isLibrarian ? "Librarian Sign Up" : "Borrower Sign Up"}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isLibrarian ? "default" : "outline"}
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
              <Label htmlFor="name">{isLibrarian ? "Staff Name" : "Full Name"}</Label>
              <Input id="name" name="name" type="text" placeholder={isLibrarian ? "Jane Doe (Staff)" : "Jane Doe"} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{isLibrarian ? "Work Email" : "Email"}</Label>
              <Input id="email" name="email" type="email" placeholder={isLibrarian ? "you@library.org" : "you@example.com"} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-black text-white dark:bg-white dark:text-black">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-xs text-muted-foreground">
          <p className="text-center w-full">
            Already have an account? {" "}
            <Link href="/login" className="underline hover:no-underline">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
