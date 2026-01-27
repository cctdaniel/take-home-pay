import type { StateCalculator } from "./types";

const STATE_NAMES: Record<string, string> = {
  TX: "Texas",
  WA: "Washington",
  FL: "Florida",
  NV: "Nevada",
  WY: "Wyoming",
  AK: "Alaska",
  SD: "South Dakota",
  TN: "Tennessee",
  NH: "New Hampshire",
};

export function createNoTaxCalculator(stateCode: string): StateCalculator {
  return {
    calculateStateTax: () => 0,
    calculateSDI: () => 0,
    getStateName: () => STATE_NAMES[stateCode] || stateCode,
  };
}

// Pre-create calculators for no-tax states
export const texasCalculator = createNoTaxCalculator("TX");
export const washingtonCalculator = createNoTaxCalculator("WA");
export const floridaCalculator = createNoTaxCalculator("FL");
export const nevadaCalculator = createNoTaxCalculator("NV");
export const wyomingCalculator = createNoTaxCalculator("WY");
export const alaskaCalculator = createNoTaxCalculator("AK");
export const southDakotaCalculator = createNoTaxCalculator("SD");
export const tennesseeCalculator = createNoTaxCalculator("TN");
export const newHampshireCalculator = createNoTaxCalculator("NH");
