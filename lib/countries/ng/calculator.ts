import { clampAmount } from "@/lib/utils";
import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { NG_CONFIG } from "./config";
import {
  NG_AVC_MAX_ADDITIONAL_RATE,
  NG_PAYE_BRACKETS_2026,
  NG_PENSION_2026,
  NG_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { NGBreakdown, NGCalculatorInputs, NGTaxBreakdown } from "./types";
import { roundCurrency } from "../calculator-utils";

function getAdditionalVoluntaryPensionLimit(grossIncome: number): number {
  return roundCurrency(grossIncome * NG_AVC_MAX_ADDITIONAL_RATE);
}

export function calculateNG(inputs: NGCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pension = roundCurrency(grossIncome * NG_PENSION_2026.employeeRate);
  const additionalVoluntaryPensionLimit = getAdditionalVoluntaryPensionLimit(grossIncome);
  const additionalVoluntaryPension = clampAmount(
    inputs.contributions?.additionalVoluntaryPension,
    additionalVoluntaryPensionLimit,
  );
  const chargeableIncome = Math.max(0, grossIncome - pension - additionalVoluntaryPension);
  const progressive = calculateProgressiveTax(chargeableIncome, NG_PAYE_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: NGTaxBreakdown = {
    type: "NG",
    totalIncomeTax: incomeTax,
    incomeTax,
    pension,
  };
  const totalTax = roundCurrency(incomeTax + pension);
  const totalDeductions = roundCurrency(totalTax + additionalVoluntaryPension);
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: NGBreakdown = {
    type: "NG",
    grossIncome,
    pension,
    chargeableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      additionalVoluntaryPension,
      additionalVoluntaryPensionLimit,
      total: additionalVoluntaryPension,
    },
    assumptions: [
      "Mandatory employee pension 8% of gross deducted before PAYE.",
      "Additional voluntary pension (AVC) deductible up to 10% of gross on top of mandatory pension.",
      "NTA 2025 Fourth Schedule PAYE brackets on chargeable income.",
      "Excludes NHF, NSITF, rent relief, life insurance, and state levies.",
    ],
    sourceUrls: Object.values(NG_SOURCE_URLS),
  };

  return {
    country: "NG",
    currency: "NGN",
    grossSalary: grossIncome,
    taxableIncome: chargeableIncome,
    taxes,
    totalTax,
    totalDeductions,
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

export const NGCalculator: CountryCalculator = {
  countryCode: "NG",
  config: NG_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NG") {
      throw new Error("NGCalculator can only calculate NG inputs");
    }
    return calculateNG(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: NGCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 7_200_000;
    const limit = getAdditionalVoluntaryPensionLimit(gross);
    return {
      additionalVoluntaryPension: {
        limit,
        name: "Additional voluntary pension (AVC)",
        description:
          "Extra pension contributions under the Pension Reform Act, deductible before PAYE (modeled up to 10% of gross).",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): NGCalculatorInputs {
    return {
      country: "NG",
      grossSalary: 7_200_000,
      payFrequency: "monthly",
      contributions: { additionalVoluntaryPension: 0 },
    };
  },
};
