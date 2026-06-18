import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { DO_CONFIG } from "./config";
import {
  DO_AFP_EMPLOYEE_RATE,
  DO_AFP_MONTHLY_CAP,
  DO_ISR_BRACKETS_2026,
  DO_ISR_EXEMPT_2026,
  DO_SFS_EMPLOYEE_RATE,
  DO_SFS_MONTHLY_CAP,
  DO_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { DOBreakdown, DOCalculatorInputs, DOTaxBreakdown } from "./types";

export function calculateDO(inputs: DOCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const monthlyGross = grossIncome / 12;
  const afpBase = Math.min(monthlyGross, DO_AFP_MONTHLY_CAP);
  const sfsBase = Math.min(monthlyGross, DO_SFS_MONTHLY_CAP);
  const afpEmployee = roundCurrency(afpBase * DO_AFP_EMPLOYEE_RATE * 12);
  const sfsEmployee = roundCurrency(sfsBase * DO_SFS_EMPLOYEE_RATE * 12);
  const tssEmployee = roundCurrency(afpEmployee + sfsEmployee);
  const incomeAfterTss = Math.max(0, grossIncome - tssEmployee);
  const progressive = calculateProgressiveTax(incomeAfterTss, DO_ISR_BRACKETS_2026);
  const incomeTax = progressive.tax;
  const taxableIncome = Math.max(0, incomeAfterTss - DO_ISR_EXEMPT_2026);

  const taxes: DOTaxBreakdown = {
    type: "DO",
    totalIncomeTax: incomeTax,
    incomeTax,
    tssEmployee,
  };
  const totalTax = roundCurrency(incomeTax + tssEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: DOBreakdown = {
    type: "DO",
    grossIncome,
    tssEmployee,
    isrExemption: DO_ISR_EXEMPT_2026,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "TSS employee AFP 2.87% (cap 20× min wage) and SFS 3.04% (cap 10× min wage) monthly.",
      "ISR on salary after TSS with DOP 416,220 exempt, then 15%/20%/25% brackets.",
      "Excludes other deductions, aguinaldo, and employer TSS.",
    ],
    sourceUrls: Object.values(DO_SOURCE_URLS),
  };

  return {
    country: "DO",
    currency: "DOP",
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

export const DOCalculator: CountryCalculator = {
  countryCode: "DO",
  config: DO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DO") {
      throw new Error("DOCalculator can only calculate DO inputs");
    }
    return calculateDO(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): DOCalculatorInputs {
    return {
      country: "DO",
      grossSalary: 720_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
