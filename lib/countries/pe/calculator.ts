import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { PE_CONFIG } from "./config";
import {
  PE_PENSION_EMPLOYEE_RATE,
  PE_PIT_BRACKETS_2026,
  PE_SOURCE_URLS,
  PE_WORK_INCOME_DEDUCTION_ANNUAL,
} from "./constants/tax-year-2026";
import type { PEBreakdown, PECalculatorInputs, PETaxBreakdown } from "./types";

export function calculatePE(inputs: PECalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pension = roundCurrency(grossIncome * PE_PENSION_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - PE_WORK_INCOME_DEDUCTION_ANNUAL),
  );
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    PE_PIT_BRACKETS_2026,
  );

  const taxes: PETaxBreakdown = {
    type: "PE",
    totalIncomeTax: incomeTax,
    incomeTax,
    pension,
  };
  const totalTax = incomeTax + pension;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: PEBreakdown = {
    type: "PE",
    grossIncome,
    pension: {
      rate: PE_PENSION_EMPLOYEE_RATE,
      employee: pension,
    },
    workIncomeDeduction: PE_WORK_INCOME_DEDUCTION_ANNUAL,
    taxableIncome,
    bracketTaxes,
    incomeTax: { total: incomeTax },
    voluntaryContributions: { total: 0 },
    assumptions: [
      "Employee pension ~13% on gross (ONP/AFP blended rate).",
      "7 UIT (PEN 38,500) work-income deduction before progressive fifth-category PIT.",
      "AFP voluntary top-ups and EsSalud employee share not modeled.",
      "Excludes CTS, gratificaciones, and employer-only contributions.",
    ],
    sourceUrls: Object.values(PE_SOURCE_URLS),
  };

  return {
    country: "PE",
    currency: "PEN",
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

export const PECalculator: CountryCalculator = {
  countryCode: "PE",
  config: PE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PE") {
      throw new Error("PECalculator can only calculate PE inputs");
    }
    return calculatePE(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): PECalculatorInputs {
    return {
      country: "PE",
      grossSalary: 60_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
