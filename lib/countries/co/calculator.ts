import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { CO_CONFIG } from "./config";
import {
  CO_HEALTH_EMPLOYEE_RATE,
  CO_PENSION_EMPLOYEE_RATE,
  CO_PIT_BRACKETS_2026,
  CO_SOLIDARITY_EMPLOYEE_RATE,
  CO_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { COBreakdown, COCalculatorInputs, COTaxBreakdown } from "./types";

export function calculateCO(inputs: COCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pension = roundCurrency(grossIncome * CO_PENSION_EMPLOYEE_RATE);
  const health = roundCurrency(grossIncome * CO_HEALTH_EMPLOYEE_RATE);
  const solidarity = roundCurrency(grossIncome * CO_SOLIDARITY_EMPLOYEE_RATE);
  const mandatoryTotal = pension + health + solidarity;
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - mandatoryTotal));
  const progressive = calculateProgressiveTax(taxableIncome, CO_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: COTaxBreakdown = {
    type: "CO",
    totalIncomeTax: incomeTax,
    incomeTax,
    pension,
    health,
    solidarity,
  };
  const totalTax = incomeTax + mandatoryTotal;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: COBreakdown = {
    type: "CO",
    grossIncome,
    mandatoryContributions: {
      pensionRate: CO_PENSION_EMPLOYEE_RATE,
      healthRate: CO_HEALTH_EMPLOYEE_RATE,
      solidarityRate: CO_SOLIDARITY_EMPLOYEE_RATE,
      total: mandatoryTotal,
    },
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee pension 4%, health 4%, and solidarity 1% on gross salary.",
      "Simplified UVT-based progressive withholding on taxable income after mandatory contributions.",
      "Excludes AFC voluntary pension, housing interest, and health/education deductions.",
    ],
    sourceUrls: Object.values(CO_SOURCE_URLS),
  };

  return {
    country: "CO",
    currency: "COP",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
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

export const COCalculator: CountryCalculator = {
  countryCode: "CO",
  config: CO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CO") {
      throw new Error("COCalculator can only calculate CO inputs");
    }
    return calculateCO(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): COCalculatorInputs {
    return {
      country: "CO",
      grossSalary: 120_000_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
