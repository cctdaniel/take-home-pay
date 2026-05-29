import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { FI_CONFIG } from "./config";
import { FI_VOLUNTARY_PENSION_ANNUAL_CAP_2026, FI_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FIBreakdown, FICalculatorInputs, FITaxBreakdown } from "./types";

export function calculateFI(inputs: FICalculatorInputs): CalculationResult {
  const voluntaryPension = clampAmount(
    inputs.contributions?.voluntaryPension,
    FI_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
  );
  const computation = calculateNordicTax(inputs.grossSalary, {
    ...FI_TAX_CONFIG,
    standardDeduction: FI_TAX_CONFIG.standardDeduction + voluntaryPension,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(
    inputs.grossSalary - computation.totalTax - voluntaryPension,
  );

  const taxes: FITaxBreakdown = {
    type: "FI",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: FIBreakdown = {
    type: "FI",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: FI_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: FI_TAX_CONFIG.employeeSocialRate,
      cap: FI_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: FI_TAX_CONFIG.standardDeduction,
    assumptions: FI_TAX_CONFIG.assumptions,
    sourceUrls: FI_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      voluntaryPension,
      voluntaryPensionLimit: FI_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
      total: voluntaryPension,
    },
  };

  return {
    country: "FI",
    currency: "EUR",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax + voluntaryPension,
    netSalary,
    effectiveTaxRate: inputs.grossSalary > 0 ? computation.totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const FICalculator: CountryCalculator = {
  countryCode: "FI",
  config: FI_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "FI") {
      throw new Error("FICalculator can only calculate FI inputs");
    }

    return calculateFI(inputs as FICalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryPension: {
        limit: FI_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
        name: "Voluntary pension",
        description: "2026 earned-income deduction cap",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): FICalculatorInputs {
    return {
      country: "FI",
      grossSalary: 60_000,
      payFrequency: "monthly",
      contributions: { voluntaryPension: 0 },
    };
  },
};
