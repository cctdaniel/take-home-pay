import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { UA_CONFIG } from "./config";
import {
  UA_EMPLOYER_USC_RATE,
  UA_MILITARY_TAX_RATE,
  UA_PIT_RATE,
  UA_SOURCE_URLS,
  UA_USC_MONTHLY_CAP_2026,
} from "./constants/tax-year-2026";
import type { UABreakdown, UACalculatorInputs, UATaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

export function calculateUA(inputs: UACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const incomeTax = roundCurrency(grossIncome * UA_PIT_RATE);
  const militaryTax = roundCurrency(grossIncome * UA_MILITARY_TAX_RATE);
  const uscBase = Math.min(grossIncome, UA_USC_MONTHLY_CAP_2026 * 12);
  const employerUsc = roundCurrency(uscBase * UA_EMPLOYER_USC_RATE);

  const taxes: UATaxBreakdown = {
    type: "UA",
    totalIncomeTax: incomeTax + militaryTax,
    incomeTax,
    militaryTax,
  };
  const totalTax = incomeTax + militaryTax;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: UABreakdown = {
    type: "UA",
    grossIncome,
    incomeTax: { rate: UA_PIT_RATE, total: incomeTax },
    militaryTax: { rate: UA_MILITARY_TAX_RATE, total: militaryTax },
    employerUsc: {
      rate: UA_EMPLOYER_USC_RATE,
      base: uscBase,
      total: employerUsc,
    },
    assumptions: [
      "Employee salary: 18% personal income tax plus 5% military tax withheld from gross.",
      "Unified social contribution (22%) is employer-paid on capped base and not deducted from net salary.",
      "Standard employment; excludes special military-service rates and simplified entrepreneur regimes.",
    ],
    sourceUrls: Object.values(UA_SOURCE_URLS),
  };

  return {
    country: "UA",
    currency: "UAH",
    grossSalary: grossIncome,
    taxableIncome: grossIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate: grossIncome > 0 ? totalTax / grossIncome : 0,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const UACalculator: CountryCalculator = {
  countryCode: "UA",
  config: UA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "UA") {
      throw new Error("UACalculator can only calculate UA inputs");
    }
    return calculateUA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): UACalculatorInputs {
    return {
      country: "UA",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
