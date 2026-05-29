import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { TR_CONFIG } from "./config";
import {
  calculateTrProgressiveTax,
  calculateTrSgkBase,
  TR_BES_MAX_GROSS_RATE,
  TR_BES_TAX_CREDIT_RATE,
  TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026,
  TR_SOCIAL_2026,
  TR_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { TRBreakdown, TRCalculatorInputs, TRTaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function getPrivatePensionLimit(grossSalary: number): number {
  return Math.max(0, grossSalary) * TR_BES_MAX_GROSS_RATE;
}

export function calculateTR(inputs: TRCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const privatePensionLimit = getPrivatePensionLimit(grossSalary);
  const privatePension = clampAmount(
    inputs.contributions?.privatePension,
    privatePensionLimit,
  );
  const minimumWageExemption = Math.min(
    grossSalary,
    TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026,
  );
  const taxableAfterExemption = Math.max(0, grossSalary - minimumWageExemption);
  const { totalTax: grossIncomeTax, bracketTaxes } =
    calculateTrProgressiveTax(taxableAfterExemption);
  const besTaxCredit = roundCurrency(
    Math.min(grossIncomeTax, privatePension * TR_BES_TAX_CREDIT_RATE),
  );
  const incomeTax = roundCurrency(Math.max(0, grossIncomeTax - besTaxCredit));

  const sgkBase = calculateTrSgkBase(grossSalary);
  const sgk = roundCurrency(sgkBase * TR_SOCIAL_2026.sgkEmployeeRate);
  const unemployment = roundCurrency(
    sgkBase * TR_SOCIAL_2026.unemploymentEmployeeRate,
  );

  const taxes: TRTaxBreakdown = {
    type: "TR",
    totalIncomeTax: incomeTax,
    incomeTax,
    sgk,
    unemployment,
  };

  const totalTax = incomeTax + sgk + unemployment;
  const totalDeductions = totalTax + privatePension;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: TRBreakdown = {
    type: "TR",
    grossIncome: grossSalary,
    taxableIncome: taxableAfterExemption,
    minimumWageExemption,
    taxableAfterExemption,
    bracketTaxes,
    sgkBase,
    social: {
      sgkRate: TR_SOCIAL_2026.sgkEmployeeRate,
      unemploymentRate: TR_SOCIAL_2026.unemploymentEmployeeRate,
      monthlySgkCeiling: TR_SOCIAL_2026.monthlySgkCeiling,
    },
    voluntaryContributions: {
      privatePension,
      privatePensionLimit,
      besTaxCredit,
      total: privatePension,
    },
    assumptions: [
      "GVK progressive income tax 15%–40% after minimum-wage exemption.",
      "Minimum wage exemption TRY 26,005/month × 12 (2026 gross minimum wage).",
      "SGK employee 14% and unemployment 1% on capped insurable earnings.",
      "BES private pension up to 3% of gross; income tax credit 30% of contribution capped at tax due.",
      "Stamp tax and AGI credits beyond BES are excluded.",
    ],
    sourceUrls: TR_SOURCE_URLS,
  };

  return {
    country: "TR",
    currency: "TRY",
    grossSalary,
    taxableIncome: taxableAfterExemption,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const TRCalculator: CountryCalculator = {
  countryCode: "TR",
  config: TR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "TR") {
      throw new Error("TRCalculator can only calculate TR inputs");
    }
    return calculateTR(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: TRCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 600_000;
    return {
      privatePension: {
        limit: getPrivatePensionLimit(gross),
        name: "BES private pension",
        description:
          "Employee BES contribution up to 3% of gross; 30% income tax credit",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): TRCalculatorInputs {
    return {
      country: "TR",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {
        privatePension: 0,
      },
    };
  },
};
