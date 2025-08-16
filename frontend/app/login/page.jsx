"use client";

import { useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Github, Mail } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState("borrower"); // borrower | librarian
  const [loading, setLoading] = useState(false);

  async function handleSocialLogin(provider) {
    setLoading(true);
    try {
      await signIn(provider, { 
        callbackUrl: "/dashboard",
        // Pass role as part of the callback
        role: role
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
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
          <CardDescription>
            Choose your role and sign in with your preferred account
          </CardDescription>
          
          {/* Role Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isLibrarian ? "outline" : "default"}
              className={!isLibrarian ? "bg-black text-white dark:bg-white dark:text-black" : ""}
              onClick={() => setRole("borrower")}
              size="sm"
            >
              Borrower
            </Button>
            <Button
              type="button"
              variant={isLibrarian ? "default" : "outline"}
              className={isLibrarian ? "bg-black text-white dark:bg-white dark:text-black" : ""}
              onClick={() => setRole("librarian")}
              size="sm"
            >
              Librarian
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          {isLibrarian && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground text-center">
                💡 Librarians: Use your institutional Google/GitHub account
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 text-xs text-muted-foreground">
          <p className="text-center w-full">
            Don't have an account?{" "}
            <Link href="/signup" className="underline hover:no-underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}