import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { PA_CONFIG } from "./config";
import {
  PA_CSS_EMPLOYEE_RATE,
  PA_EDUCATION_EMPLOYEE_RATE,
  PA_PIT_BRACKETS_2026,
  PA_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { PABreakdown, PACalculatorInputs, PATaxBreakdown } from "./types";

export function calculatePA(inputs: PACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const cssEmployee = roundCurrency(grossIncome * PA_CSS_EMPLOYEE_RATE);
  const educationEmployee = roundCurrency(grossIncome * PA_EDUCATION_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - cssEmployee - educationEmployee),
  );
  const progressive = calculateProgressiveTax(taxableIncome, PA_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: PATaxBreakdown = {
    type: "PA",
    totalIncomeTax: incomeTax,
    incomeTax,
    cssEmployee,
    educationEmployee,
  };
  const mandatoryTotal = cssEmployee + educationEmployee;
  const totalTax = roundCurrency(incomeTax + mandatoryTotal);
  const totalDeductions = totalTax;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: PABreakdown = {
    type: "PA",
    grossIncome,
    cssEmployee,
    educationEmployee,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "CSS employee 9.75% and educational insurance 1.25% on gross (2025 reform rates).",
      "Progressive PIT on Panama-sourced salary after social deductions.",
      "Territorial taxation: foreign-sourced remote income is often exempt — not modeled here.",
      "Excludes fondos de reserva, aguinaldo, and employer-only contributions.",
    ],
    sourceUrls: Object.values(PA_SOURCE_URLS),
  };

  return {
    country: "PA",
    currency: "USD",
    grossSalary: grossIncome,
    taxableIncome,
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

export const PACalculator: CountryCalculator = {
  countryCode: "PA",
  config: PA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PA") {
      throw new Error("PACalculator can only calculate PA inputs");
    }
    return calculatePA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): PACalculatorInputs {
    return {
      country: "PA",
      grossSalary: 48_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
