import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanedArray(input: string): unknown {
  if (!input || typeof input !== 'string') {
    throw new Error('cleanedArray: input must be a non-empty string');
  }

  try {
    const fixed = input.replace(/\\"/g, '"'); // fix escaped quotes only
    return JSON.parse(fixed);
  } catch (error) {
    throw new Error(`cleanedArray: Failed to parse JSON - ${
      error instanceof Error ?
      error.message :
      'unknown error'
    }`);
  };
};