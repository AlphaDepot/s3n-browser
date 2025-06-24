import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names using clsx and tailwind-merge.
 * This is useful for conditionally applying classes and ensuring no conflicts.
 * @param inputs
 */
export function classMerger(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
