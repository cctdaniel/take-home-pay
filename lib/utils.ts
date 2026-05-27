import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Two-argument form: clampAmount(value, max) -> clamp to [0, max]
// Three-argument form: clampAmount(value, min, max) -> clamp to [min, max]
// Accepts undefined value (treats as 0). Negative max/min are guarded
// by Math.max(0, max) so callers can safely pass computed limits.
export function clampAmount(
  value: number | undefined,
  maxOrMin: number,
  max?: number,
): number {
  const resolved = value ?? 0;
  const min = max === undefined ? 0 : maxOrMin;
  const actualMax = max === undefined ? maxOrMin : max;
  return Math.min(Math.max(min, resolved), Math.max(min, actualMax));
}

// Floor an integer count and clamp to [0, max]. Accepts undefined value.
export function clampCount(
  value: number | undefined,
  max: number,
): number {
  return Math.min(Math.max(0, Math.floor(value ?? 0)), max);
}
