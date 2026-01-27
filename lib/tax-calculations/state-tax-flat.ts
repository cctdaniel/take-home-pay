import { FLAT_TAX_RATES, FLAT_TAX_STATE_DEDUCTIONS } from "../constants/state-tax-brackets-2025";
import type { FilingStatus } from "../constants/tax-brackets-2025";
import type { StateCalculator } from "./types";

const STATE_NAMES: Record<string, string> = {
  MA: "Massachusetts",
  IL: "Illinois",
  PA: "Pennsylvania",
  CO: "Colorado",
  NC: "North Carolina",
  MI: "Michigan",
  IN: "Indiana",
  UT: "Utah",
  AZ: "Arizona",
  ID: "Idaho",
  KY: "Kentucky",
  MS: "Mississippi",
  ND: "North Dakota",
  SC: "South Carolina",
};

export function createFlatTaxCalculator(stateCode: string): StateCalculator {
  const rate = FLAT_TAX_RATES[stateCode];
  const deductions = FLAT_TAX_STATE_DEDUCTIONS[stateCode];

  if (rate === undefined) {
    throw new Error(`Unknown flat tax state: ${stateCode}`);
  }

  return {
    calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
      const deduction = deductions?.[filingStatus] ?? 0;
      const adjustedIncome = Math.max(0, taxableIncome - deduction);
      return adjustedIncome * rate;
    },
    calculateSDI: () => 0, // Most flat tax states don't have SDI
    getStateName: () => STATE_NAMES[stateCode] || stateCode,
  };
}

// Pre-create calculators for common flat tax states
export const massachusettsCalculator = createFlatTaxCalculator("MA");
export const illinoisCalculator = createFlatTaxCalculator("IL");
export const pennsylvaniaCalculator = createFlatTaxCalculator("PA");
export const coloradoCalculator = createFlatTaxCalculator("CO");
export const northCarolinaCalculator = createFlatTaxCalculator("NC");
export const michiganCalculator = createFlatTaxCalculator("MI");
export const indianaCalculator = createFlatTaxCalculator("IN");
export const utahCalculator = createFlatTaxCalculator("UT");
export const arizonaCalculator = createFlatTaxCalculator("AZ");
export const idahoCalculator = createFlatTaxCalculator("ID");
export const kentuckyCalculator = createFlatTaxCalculator("KY");
export const mississippiCalculator = createFlatTaxCalculator("MS");
export const northDakotaCalculator = createFlatTaxCalculator("ND");
export const southCarolinaCalculator = createFlatTaxCalculator("SC");
