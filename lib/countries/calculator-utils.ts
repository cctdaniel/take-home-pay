import type { PayFrequency } from "./types";

export function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
