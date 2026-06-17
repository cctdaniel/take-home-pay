import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { BB_CONFIG } from "./config";
import {
  BB_NIS_ANNUAL_CAP,
  BB_NIS_EMPLOYEE_RATE,
  BB_PAYE_ALLOWANCE_2026,
  BB_PAYE_BRACKETS_2026,
  BB_RESILIENCE_FUND_RATE,
  BB_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { BBBreakdown, BBCalculatorInputs, BBTaxBreakdown } from "./types";

export function calculateBB(inputs: BBCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const nisBase = Math.min(grossIncome, BB_NIS_ANNUAL_CAP);
  const nisEmployee = roundCurrency(nisBase * BB_NIS_EMPLOYEE_RATE);
  const resilienceFund = roundCurrency(grossIncome * BB_RESILIENCE_FUND_RATE);
  const payeTaxableIncome = Math.max(0, grossIncome - BB_PAYE_ALLOWANCE_2026);
  const progressive = calculateProgressiveTax(
    payeTaxableIncome,
    BB_PAYE_BRACKETS_2026,
  );
  const incomeTax = progressive.tax;
  const taxableIncome = payeTaxableIncome;

  const taxes: BBTaxBreakdown = {
    type: "BB",
    totalIncomeTax: incomeTax,
    incomeTax,
    nisEmployee,
    resilienceFund,
  };
  const totalTax = roundCurrency(incomeTax + nisEmployee + resilienceFund);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BBBreakdown = {
    type: "BB",
    grossIncome,
    nisEmployee,
    resilienceFund,
    payeAllowance: BB_PAYE_ALLOWANCE_2026,
    payeTaxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "NIS employee 11% on gross capped at BBD 5,280/month; not deductible from PAYE.",
      "National Resilience Fund 0.25% employee levy on gross.",
      "PAYE on income after BBD 25,000 allowance: 12.5% to BBD 50,000 taxable, 28.5% above.",
      "Excludes employer NIS and special expatriate regimes.",
    ],
    sourceUrls: Object.values(BB_SOURCE_URLS),
  };

  return {
    country: "BB",
    currency: "BBD",
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

export const BBCalculator: CountryCalculator = {
  countryCode: "BB",
  config: BB_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BB") {
      throw new Error("BBCalculator can only calculate BB inputs");
    }
    return calculateBB(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): BBCalculatorInputs {
    return {
      country: "BB",
      grossSalary: 80_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
