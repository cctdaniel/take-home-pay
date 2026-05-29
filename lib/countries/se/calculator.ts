import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { SE_CONFIG } from "./config";
import { SE_IPS_DEDUCTION_RATE, SE_IPS_MAX_INCOME_FOR_DEDUCTION_2026, SE_TAX_CONFIG } from "./constants/tax-year-2026";
import type { SEBreakdown, SECalculatorInputs, SETaxBreakdown } from "./types";

export function calculateSE(inputs: SECalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const ipsLimit = Math.min(
    grossIncome * SE_IPS_DEDUCTION_RATE,
    SE_IPS_MAX_INCOME_FOR_DEDUCTION_2026 * SE_IPS_DEDUCTION_RATE,
  );
  const ipsContribution = clampAmount(
    inputs.contributions?.ipsContribution,
    ipsLimit,
  );
  const computation = calculateNordicTax(inputs.grossSalary, {
    ...SE_TAX_CONFIG,
    standardDeduction: SE_TAX_CONFIG.standardDeduction + ipsContribution,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(
    inputs.grossSalary - computation.totalTax - ipsContribution,
  );

  const taxes: SETaxBreakdown = {
    type: "SE",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
  };

  const breakdown: SEBreakdown = {
    type: "SE",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: SE_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: SE_TAX_CONFIG.employeeSocialRate,
      cap: SE_TAX_CONFIG.employeeSocialContributionCap,
    },
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
    standardDeduction: SE_TAX_CONFIG.standardDeduction,
    assumptions: SE_TAX_CONFIG.assumptions,
    sourceUrls: SE_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      ipsContribution,
      ipsDeductionLimit: ipsLimit,
      total: ipsContribution,
    },
  };

  return {
    country: "SE",
    currency: "SEK",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax + ipsContribution,
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

export const SECalculator: CountryCalculator = {
  countryCode: "SE",
  config: SE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SE") {
      throw new Error("SECalculator can only calculate SE inputs");
    }

    return calculateSE(inputs as SECalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = inputs?.grossSalary ?? SE_TAX_CONFIG.defaultSalary;
    const ipsLimit = Math.min(gross * SE_IPS_DEDUCTION_RATE, SE_IPS_MAX_INCOME_FOR_DEDUCTION_2026 * SE_IPS_DEDUCTION_RATE);
    return {
      ipsContribution: {
        limit: ipsLimit,
        name: "IPS pension savings",
        description: "35% of income deduction when no occupational pension",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): SECalculatorInputs {
    return {
      country: "SE",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: { ipsContribution: 0 },
    };
  },
};
