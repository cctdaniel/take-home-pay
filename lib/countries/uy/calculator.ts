import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { UY_CONFIG } from "./config";
import {
  UY_BPS_EMPLOYEE_RATE,
  UY_FONASA_EMPLOYEE_RATE,
  UY_FRL_EMPLOYEE_RATE,
  UY_IRPF_BRACKETS_2026,
  UY_MNIG_ANNUAL,
  UY_SOCIAL_EMPLOYEE_RATE,
  UY_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { UYBreakdown, UYCalculatorInputs, UYTaxBreakdown } from "./types";

export function calculateUY(inputs: UYCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialSecurity = roundCurrency(grossIncome * UY_SOCIAL_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - socialSecurity));
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    UY_IRPF_BRACKETS_2026,
  );

  const taxes: UYTaxBreakdown = {
    type: "UY",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: UYBreakdown = {
    type: "UY",
    grossIncome,
    socialSecurity: {
      rate: UY_SOCIAL_EMPLOYEE_RATE,
      bpsRate: UY_BPS_EMPLOYEE_RATE,
      frlRate: UY_FRL_EMPLOYEE_RATE,
      fonasaRate: UY_FONASA_EMPLOYEE_RATE,
      employee: socialSecurity,
    },
    mnigAnnual: UY_MNIG_ANNUAL,
    taxableIncome,
    bracketTaxes,
    incomeTax: { total: incomeTax },
    voluntaryContributions: { total: 0 },
    assumptions: [
      "Employee contributions: BPS 15%, FRL 0.1%, FONASA 3% (18.1% total) on gross.",
      "Progressive IRPF on gross minus employee social, with MNIG exempt up to 7 BPC/year.",
      "No voluntary AFAP top-ups or family deductions modeled.",
      "Excludes aguinaldo, employer costs, and special sector regimes.",
    ],
    sourceUrls: Object.values(UY_SOURCE_URLS),
  };

  return {
    country: "UY",
    currency: "UYU",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const UYCalculator: CountryCalculator = {
  countryCode: "UY",
  config: UY_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "UY") {
      throw new Error("UYCalculator can only calculate UY inputs");
    }
    return calculateUY(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): UYCalculatorInputs {
    return {
      country: "UY",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
