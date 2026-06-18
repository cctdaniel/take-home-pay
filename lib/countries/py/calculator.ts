import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { PY_CONFIG } from "./config";
import {
  PY_IPS_EMPLOYEE_RATE,
  PY_IRP_BRACKETS_2026,
  PY_IRP_MINIMUM_GROSS,
  PY_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { PYBreakdown, PYCalculatorInputs, PYTaxBreakdown } from "./types";

export function calculatePY(inputs: PYCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const ipsEmployee = roundCurrency(grossIncome * PY_IPS_EMPLOYEE_RATE);
  const netIncome = Math.max(0, grossIncome - ipsEmployee);
  const irpTaxableIncome =
    grossIncome > PY_IRP_MINIMUM_GROSS ? netIncome : 0;
  const progressive =
    irpTaxableIncome > 0
      ? calculateProgressiveTax(irpTaxableIncome, PY_IRP_BRACKETS_2026)
      : { tax: 0, details: [] };
  const incomeTax = progressive.tax;
  const taxableIncome = irpTaxableIncome;

  const taxes: PYTaxBreakdown = {
    type: "PY",
    totalIncomeTax: incomeTax,
    incomeTax,
    ipsEmployee,
  };
  const totalTax = roundCurrency(incomeTax + ipsEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: PYBreakdown = {
    type: "PY",
    grossIncome,
    ipsEmployee,
    irpTaxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "IPS employee 9% on gross salary.",
      "IRP applies only when annual gross exceeds PYG 80,000,000.",
      "Progressive IRP 8%/9%/10% on full net income (after IPS) across 50M/150M bands.",
      "Excludes IVA, aguinaldo, and simplified-regime flat taxes.",
    ],
    sourceUrls: Object.values(PY_SOURCE_URLS),
  };

  return {
    country: "PY",
    currency: "PYG",
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

export const PYCalculator: CountryCalculator = {
  countryCode: "PY",
  config: PY_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PY") {
      throw new Error("PYCalculator can only calculate PY inputs");
    }
    return calculatePY(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): PYCalculatorInputs {
    return {
      country: "PY",
      grossSalary: 120_000_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
