import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Library Management App</h1>
        <Link href='/dashboard'>
          <Button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-800 transition">
            Go to Dashboard
          </Button>
        </Link>
        <div className="mt-4 top-2 right-2">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
