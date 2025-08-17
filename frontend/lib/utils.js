import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// API URL utility
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
