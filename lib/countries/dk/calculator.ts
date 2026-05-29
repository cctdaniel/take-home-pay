import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { DK_CONFIG } from "./config";
import { DK_RATEPENSION_ANNUAL_CAP_2026, DK_TAX_CONFIG } from "./constants/tax-year-2026";
import type { DKBreakdown, DKCalculatorInputs, DKTaxBreakdown } from "./types";

export function calculateDK(inputs: DKCalculatorInputs): CalculationResult {
  const ratepension = clampAmount(
    inputs.contributions?.ratepension,
    DK_RATEPENSION_ANNUAL_CAP_2026,
  );
  const computation = calculateNordicTax(inputs.grossSalary, {
    ...DK_TAX_CONFIG,
    standardDeduction: DK_TAX_CONFIG.standardDeduction + ratepension,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(
    inputs.grossSalary - computation.totalTax - ratepension,
  );

  const taxes: DKTaxBreakdown = {
    type: "DK",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: DKBreakdown = {
    type: "DK",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: DK_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: DK_TAX_CONFIG.employeeSocialRate,
      cap: DK_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: DK_TAX_CONFIG.standardDeduction,
    assumptions: DK_TAX_CONFIG.assumptions,
    sourceUrls: DK_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      ratepension,
      ratepensionLimit: DK_RATEPENSION_ANNUAL_CAP_2026,
      total: ratepension,
    },
  };

  return {
    country: "DK",
    currency: "DKK",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax + ratepension,
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

export const DKCalculator: CountryCalculator = {
  countryCode: "DK",
  config: DK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DK") {
      throw new Error("DKCalculator can only calculate DK inputs");
    }

    return calculateDK(inputs as DKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      ratepension: {
        limit: DK_RATEPENSION_ANNUAL_CAP_2026,
        name: "Ratepension",
        description: "Combined rate/term annuity cap",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): DKCalculatorInputs {
    return {
      country: "DK",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: { ratepension: 0 },
    };
  },
};
