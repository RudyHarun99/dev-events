import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanedArray(input: string) {
  const raw = input;
  const fixed = raw.replace(/\\"/g, '"'); // fix escaped quotes only
  const cleaned = JSON.parse(fixed);
  return cleaned;
}