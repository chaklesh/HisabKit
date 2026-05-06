import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Enterprise Utility: Class Name Merger
 * Combines clsx and tailwind-merge for conflict-free styling.
 * Foundational for Shadcn/UI primitives.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
