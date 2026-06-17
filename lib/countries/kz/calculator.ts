import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { KZ_CONFIG } from "./config";
import {
  KZ_IIT_BRACKETS_2026,
  KZ_OMIC_EMPLOYEE_RATE,
  KZ_OMIC_MONTHLY_BASE_CAP_2026,
  KZ_OPC_EMPLOYEE_RATE,
  KZ_SOURCE_URLS,
  KZ_STANDARD_DEDUCTION_2026,
} from "./constants/tax-year-2026";
import type { KZBreakdown, KZCalculatorInputs, KZTaxBreakdown } from "./types";

function calculateOmicEmployee(grossSalary: number): number {
  const monthlyGross = grossSalary / 12;
  const monthlyBase = Math.min(monthlyGross, KZ_OMIC_MONTHLY_BASE_CAP_2026);
  return roundCurrency(monthlyBase * KZ_OMIC_EMPLOYEE_RATE * 12);
}

export function calculateKZ(inputs: KZCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const opcEmployee = roundCurrency(grossIncome * KZ_OPC_EMPLOYEE_RATE);
  const omicEmployee = calculateOmicEmployee(grossIncome);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - KZ_STANDARD_DEDUCTION_2026 - opcEmployee - omicEmployee),
  );
  const progressive = calculateProgressiveTax(taxableIncome, KZ_IIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: KZTaxBreakdown = {
    type: "KZ",
    totalIncomeTax: incomeTax,
    incomeTax,
    opcEmployee,
    omicEmployee,
  };
  const mandatoryTotal = opcEmployee + omicEmployee;
  const totalTax = incomeTax + mandatoryTotal;
  const totalDeductions = totalTax;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: KZBreakdown = {
    type: "KZ",
    grossIncome,
    standardDeduction: KZ_STANDARD_DEDUCTION_2026,
    opcEmployee,
    omicEmployee,
    omicMonthlyCap: KZ_OMIC_MONTHLY_BASE_CAP_2026,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee OPC pension 10% and OMIC health 2% on gross (OMIC base capped at 20× minimum wage monthly).",
      "Standard deduction of 360 MCI and mandatory social contributions reduce the IIT base.",
      "IIT at 10% up to 8,500 MCI annually and 15% on the excess.",
      "Excludes other deductions, tax credits, and non-resident regimes.",
    ],
    sourceUrls: Object.values(KZ_SOURCE_URLS),
  };

  return {
    country: "KZ",
    currency: "KZT",
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

export const KZCalculator: CountryCalculator = {
  countryCode: "KZ",
  config: KZ_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "KZ") {
      throw new Error("KZCalculator can only calculate KZ inputs");
    }
    return calculateKZ(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): KZCalculatorInputs {
    return {
      country: "KZ",
      grossSalary: 6_000_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
