import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { ME_CONFIG } from "./config";
import {
  ME_MONTHLY_PIT_RATE_MID,
  ME_MONTHLY_PIT_RATE_TOP,
  ME_MONTHLY_PIT_THRESHOLD_LOW,
  ME_MONTHLY_PIT_THRESHOLD_MID,
  ME_PENSION_ANNUAL_CAP,
  ME_PENSION_EMPLOYEE_RATE,
  ME_SOURCE_URLS,
  ME_UNEMPLOYMENT_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { MEBreakdown, MECalculatorInputs, METaxBreakdown } from "./types";

function calculateMEMonthlyPIT(monthlyTaxable: number): number {
  if (monthlyTaxable <= ME_MONTHLY_PIT_THRESHOLD_LOW) {
    return 0;
  }
  if (monthlyTaxable <= ME_MONTHLY_PIT_THRESHOLD_MID) {
    return roundCurrency(
      (monthlyTaxable - ME_MONTHLY_PIT_THRESHOLD_LOW) * ME_MONTHLY_PIT_RATE_MID,
    );
  }
  const midBandTax =
    (ME_MONTHLY_PIT_THRESHOLD_MID - ME_MONTHLY_PIT_THRESHOLD_LOW) *
    ME_MONTHLY_PIT_RATE_MID;
  return roundCurrency(
    midBandTax +
      (monthlyTaxable - ME_MONTHLY_PIT_THRESHOLD_MID) * ME_MONTHLY_PIT_RATE_TOP,
  );
}

export function calculateME(inputs: MECalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pensionBase = Math.min(grossIncome, ME_PENSION_ANNUAL_CAP);
  const pensionEmployee = roundCurrency(pensionBase * ME_PENSION_EMPLOYEE_RATE);
  const unemploymentEmployee = roundCurrency(
    grossIncome * ME_UNEMPLOYMENT_EMPLOYEE_RATE,
  );
  const incomeAfterSocial = Math.max(
    0,
    grossIncome - pensionEmployee - unemploymentEmployee,
  );
  const monthlyTaxableIncome = incomeAfterSocial / 12;
  const monthlyIncomeTax = calculateMEMonthlyPIT(monthlyTaxableIncome);
  const incomeTax = roundCurrency(monthlyIncomeTax * 12);
  const taxableIncome = incomeAfterSocial;

  const taxes: METaxBreakdown = {
    type: "ME",
    totalIncomeTax: incomeTax,
    incomeTax,
    pensionEmployee,
    unemploymentEmployee,
  };
  const totalTax = roundCurrency(incomeTax + pensionEmployee + unemploymentEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: MEBreakdown = {
    type: "ME",
    grossIncome,
    pensionEmployee,
    unemploymentEmployee,
    monthlyTaxableIncome,
    monthlyIncomeTax,
    taxableIncome,
    bracketTaxes: [],
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee pension 10% on gross capped at EUR 68,765/year and unemployment 0.5% on gross.",
      "Monthly PIT tariff on salary after employee social: 0% to EUR 700, 9% to EUR 1,000, 15% above.",
      "Foreign-sourced remote income territorial rules are not modeled.",
      "Excludes employer contributions and municipal surcharges.",
    ],
    sourceUrls: Object.values(ME_SOURCE_URLS),
  };

  return {
    country: "ME",
    currency: "EUR",
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

export const MECalculator: CountryCalculator = {
  countryCode: "ME",
  config: ME_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "ME") {
      throw new Error("MECalculator can only calculate ME inputs");
    }
    return calculateME(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): MECalculatorInputs {
    return {
      country: "ME",
      grossSalary: 24_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
