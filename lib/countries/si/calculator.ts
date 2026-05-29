import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { clampAmount } from "@/lib/utils";
import { SI_CONFIG } from "./config";
import {
  SI_PENSION_EMPLOYEE_RATE,
  SI_PIT_BRACKETS_2026,
  SI_SOCIAL_EMPLOYEE_RATE,
  SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026,
  SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS,
  SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION,
  SI_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { SIBreakdown, SICalculatorInputs, SITaxBreakdown } from "./types";

export function calculateSI(inputs: SICalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pensionContributions = roundCurrency(grossIncome * SI_PENSION_EMPLOYEE_RATE);
  const supplementaryLimit = Math.min(
    SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026,
    grossIncome * SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS,
    pensionContributions * SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION,
  );
  const supplementaryPension = clampAmount(
    inputs.contributions?.supplementaryPension,
    supplementaryLimit,
  );
  const socialInsurance = roundCurrency(grossIncome * SI_SOCIAL_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - socialInsurance - supplementaryPension));
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    SI_PIT_BRACKETS_2026,
  );

  const taxes: SITaxBreakdown = {
    type: "SI",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance,
  };
  const totalTax = incomeTax + socialInsurance;
  const totalDeductions = totalTax + supplementaryPension;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: SIBreakdown = {
    type: "SI",
    grossIncome,
    socialInsurance: {
      rate: SI_SOCIAL_EMPLOYEE_RATE,
      employee: socialInsurance,
    },
    taxableIncome,
    bracketTaxes,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      supplementaryPension,
      supplementaryPensionLimit: supplementaryLimit,
      total: supplementaryPension,
    },
    assumptions: [
      "Employee social contributions modeled at 22.1% of gross salary.",
      "Progressive PIT on gross minus employee social: 16% / 26% / 33% / 39% / 50%.",
      "Supplementary pension premium reduces taxable income. salary contributions modeled.",
    ],
    sourceUrls: Object.values(SI_SOURCE_URLS),
  };

  return {
    country: "SI",
    currency: "EUR",
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

export const SICalculator: CountryCalculator = {
  countryCode: "SI",
  config: SI_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SI") {
      throw new Error("SICalculator can only calculate SI inputs");
    }
    return calculateSI(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = Math.max(0, (inputs as SICalculatorInputs | undefined)?.grossSalary ?? 36_000);
    const pensionContributions = gross * SI_PENSION_EMPLOYEE_RATE;
    const limit = Math.min(
      SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026,
      gross * SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS,
      pensionContributions * SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION,
    );
    return {
      supplementaryPension: {
        limit,
        name: "Supplementary pension insurance",
        description:
          "Tax-deductible premium up to EUR 3,224.18, 5.844% of gross, or 24% of pension contributions.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): SICalculatorInputs {
    return {
      country: "SI",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: { supplementaryPension: 0 },
    };
  },
};
