import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { UA_CONFIG } from "./config";
import {
  UA_EMPLOYER_USC_RATE,
  UA_MILITARY_TAX_RATE,
  UA_NPF_ANNUAL_CAP_2026,
  UA_NPF_TAX_DISCOUNT_RATE,
  UA_PIT_RATE,
  UA_SOURCE_URLS,
  UA_USC_MONTHLY_CAP_2026,
} from "./constants/tax-year-2026";
import type { UABreakdown, UACalculatorInputs, UATaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

export function calculateUA(inputs: UACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const npfContribution = clampAmount(
    inputs.contributions?.npfContribution,
    UA_NPF_ANNUAL_CAP_2026,
  );
  const incomeTax = roundCurrency(grossIncome * UA_PIT_RATE);
  const militaryTax = roundCurrency(grossIncome * UA_MILITARY_TAX_RATE);
  const npfTaxDiscount = roundCurrency(npfContribution * UA_NPF_TAX_DISCOUNT_RATE);
  const uscBase = Math.min(grossIncome, UA_USC_MONTHLY_CAP_2026 * 12);
  const employerUsc = roundCurrency(uscBase * UA_EMPLOYER_USC_RATE);

  const taxes: UATaxBreakdown = {
    type: "UA",
    totalIncomeTax: incomeTax + militaryTax - npfTaxDiscount,
    incomeTax,
    militaryTax,
    npfTaxDiscount,
  };
  const totalTax = Math.max(0, incomeTax + militaryTax - npfTaxDiscount);
  const totalDeductions = totalTax + npfContribution;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: UABreakdown = {
    type: "UA",
    grossIncome,
    incomeTax: { rate: UA_PIT_RATE, total: incomeTax },
    militaryTax: { rate: UA_MILITARY_TAX_RATE, total: militaryTax },
    employerUsc: { rate: UA_EMPLOYER_USC_RATE, base: uscBase, total: employerUsc },
    voluntaryContributions: {
      npfContribution,
      npfLimit: UA_NPF_ANNUAL_CAP_2026,
      npfTaxDiscount,
      total: npfContribution,
    },
    assumptions: [
      "18% PIT and 5% military tax withheld from gross salary.",
      "NPF own contributions up to UAH 55,920/year attract 18% tax discount (annual filing).",
      "Employer USC 22% on capped base is not deducted from net pay.",
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

export const UACalculator: CountryCalculator = {
  countryCode: "UA",
  config: UA_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "UA") throw new Error("UACalculator can only calculate UA inputs");
    return calculateUA(inputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(): ContributionLimits {
    return {
      npfContribution: {
        limit: UA_NPF_ANNUAL_CAP_2026,
        name: "Non-state pension fund (NPF)",
        description:
          "Own contributions up to UAH 4,660/month qualify for 18% tax discount when declared.",
        preTax: false,
      },
    };
  },
  getDefaultInputs(): UACalculatorInputs {
    return {
      country: "UA",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: { npfContribution: 0 },
    };
  },
};
