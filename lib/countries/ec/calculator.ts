import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { EC_CONFIG } from "./config";
import {
  EC_IESS_ANNUAL_CAP,
  EC_IESS_EMPLOYEE_RATE,
  EC_PIT_BRACKETS_2026,
  EC_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { ECBreakdown, ECCalculatorInputs, ECTaxBreakdown } from "./types";

export function calculateEC(inputs: ECCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const iessBase = Math.min(grossIncome, EC_IESS_ANNUAL_CAP);
  const iessEmployee = roundCurrency(iessBase * EC_IESS_EMPLOYEE_RATE);
  const incomeAfterIess = Math.max(0, grossIncome - iessEmployee);
  const progressive = calculateProgressiveTax(incomeAfterIess, EC_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;
  const taxableIncome = incomeAfterIess;

  const taxes: ECTaxBreakdown = {
    type: "EC",
    totalIncomeTax: incomeTax,
    incomeTax,
    iessEmployee,
  };
  const totalTax = roundCurrency(incomeTax + iessEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: ECBreakdown = {
    type: "EC",
    grossIncome,
    iessEmployee,
    incomeAfterIess,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "IESS employee 9.45% on gross capped at USD 45,000/year.",
      "Progressive SRI salary tax on income after IESS with USD 12,208 exempt band.",
      "USD is the official currency; foreign remote income sourcing not modeled.",
      "Excludes personal deductions beyond the basic exempt fraction and employer IESS.",
    ],
    sourceUrls: Object.values(EC_SOURCE_URLS),
  };

  return {
    country: "EC",
    currency: "USD",
    grossSalary: grossIncome,
    taxableIncome,
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

export const ECCalculator: CountryCalculator = {
  countryCode: "EC",
  config: EC_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "EC") {
      throw new Error("ECCalculator can only calculate EC inputs");
    }
    return calculateEC(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): ECCalculatorInputs {
    return {
      country: "EC",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
