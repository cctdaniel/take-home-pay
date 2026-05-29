import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { IS_CONFIG } from "./config";
import { IS_PRIVATE_PENSION_MAX_GROSS_RATE, IS_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ISBreakdown, ISCalculatorInputs, ISTaxBreakdown } from "./types";

export function calculateIS(inputs: ISCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const privatePensionLimit = grossIncome * IS_PRIVATE_PENSION_MAX_GROSS_RATE;
  const privatePensionSavings = clampAmount(
    inputs.contributions?.privatePensionSavings,
    privatePensionLimit,
  );
  const computation = calculateNordicTax(inputs.grossSalary, {
    ...IS_TAX_CONFIG,
    standardDeduction: IS_TAX_CONFIG.standardDeduction + privatePensionSavings,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(
    inputs.grossSalary - computation.totalTax - privatePensionSavings,
  );

  const taxes: ISTaxBreakdown = {
    type: "IS",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: ISBreakdown = {
    type: "IS",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: IS_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: IS_TAX_CONFIG.employeeSocialRate,
      cap: IS_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: IS_TAX_CONFIG.standardDeduction,
    assumptions: IS_TAX_CONFIG.assumptions,
    sourceUrls: IS_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      privatePensionSavings,
      privatePensionLimit,
      total: privatePensionSavings,
    },
  };

  return {
    country: "IS",
    currency: "ISK",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax + privatePensionSavings,
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

export const ISCalculator: CountryCalculator = {
  countryCode: "IS",
  config: IS_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IS") {
      throw new Error("ISCalculator can only calculate IS inputs");
    }

    return calculateIS(inputs as ISCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = inputs?.grossSalary ?? IS_TAX_CONFIG.defaultSalary;
    return {
      privatePensionSavings: {
        limit: gross * IS_PRIVATE_PENSION_MAX_GROSS_RATE,
        name: "Private pension savings",
        description: "Supplementary pension up to 4% of gross wages",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ISCalculatorInputs {
    return {
      country: "IS",
      grossSalary: 9_600_000,
      payFrequency: "monthly",
      contributions: { privatePensionSavings: 0 },
    };
  },
};
