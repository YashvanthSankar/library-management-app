import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SessionProvider } from "next-auth/react";
import LoginBtn from "@/components/login-btn";

const features = [
  { title: "Browse Books", desc: "Quick view of available titles." },
  { title: "Your Loans", desc: "Track what you borrowed." },
  { title: "Staff Panel", desc: "Basic catalog + user actions." },
];

export default function Home() {

  return (
      <div className="min-h-screen w-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
        <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold tracking-tight">Library Management</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* <Link href="/login"><Button variant="outline" className="border-gray-400 dark:border-gray-600">Login</Button></Link> */}
            <LoginBtn />
          </div>
        </header>
        <main className="flex flex-col items-center text-center flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome to the Library Management App</h2>
          <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mb-8 text-sm md:text-base">
            A modern platform to manage books, borrowers, and library operations efficiently. Built with Next.js, PostgreSQL, and a clean component system.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link href='/dashboard'>
              <Button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                Go to Dashboard
              </Button>
            </Link>
            <Link href='/login'>
              <Button variant="outline" className="px-6 py-3 text-lg font-semibold border-gray-400 dark:border-gray-600">
                Get Started
              </Button>
            </Link>
          </div>
          <section className="grid gap-4 sm:grid-cols-3 w-full max-w-4xl">
            {features.map(f => (
              <div key={f.title} className="rounded-md border border-gray-200 dark:border-gray-800 p-4 text-left">
                <h3 className="font-medium mb-1 text-sm">{f.title}</h3>
                <p className="text-[11px] leading-snug text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </section>
        </main>
        <footer className="text-xs text-center py-6 text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
          © {new Date().getFullYear()} Library Management. All rights reserved.
        </footer>
      </div>
  );
}
