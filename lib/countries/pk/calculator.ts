import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { PK_CONFIG } from "./config";
import { PK_PIT_BRACKETS_FY2026, PK_SOURCE_URLS } from "./constants/tax-year-2026";
import type { PKBreakdown, PKCalculatorInputs, PKTaxBreakdown } from "./types";

export function calculatePK(inputs: PKCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const taxableIncome = grossIncome;
  const progressive = calculateProgressiveTax(taxableIncome, PK_PIT_BRACKETS_FY2026);
  const incomeTax = progressive.tax;

  const taxes: PKTaxBreakdown = {
    type: "PK",
    totalIncomeTax: incomeTax,
    incomeTax,
  };
  const totalTax = incomeTax;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: PKBreakdown = {
    type: "PK",
    grossIncome,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "FY2026 progressive salary tax slabs on gross employment income.",
      "No employee social insurance deduction modeled for salaried employees (employer EOBI excluded).",
      "Excludes provincial taxes, Zakat, and special sector exemptions.",
    ],
    sourceUrls: Object.values(PK_SOURCE_URLS),
  };

  return {
    country: "PK",
    currency: "PKR",
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

export const PKCalculator: CountryCalculator = {
  countryCode: "PK",
  config: PK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PK") {
      throw new Error("PKCalculator can only calculate PK inputs");
    }
    return calculatePK(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): PKCalculatorInputs {
    return {
      country: "PK",
      grossSalary: 3_000_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
