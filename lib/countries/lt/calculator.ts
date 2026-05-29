import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { LT_CONFIG } from "./config";
import {
  LT_GPM_BRACKETS_2026,
  LT_PENSION_DEDUCTION_ANNUAL_CAP_2026,
  LT_PENSION_DEDUCTION_RATE_OF_INCOME,
  LT_SOURCE_URLS,
  LT_VSD_ANNUAL_CAP,
  LT_VSD_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { LTBreakdown, LTCalculatorInputs, LTTaxBreakdown } from "./types";

export function getLithuanianPensionDeductionLimit(grossAfterVsd: number): number {
  return Math.min(
    LT_PENSION_DEDUCTION_ANNUAL_CAP_2026,
    Math.max(0, grossAfterVsd) * LT_PENSION_DEDUCTION_RATE_OF_INCOME,
  );
}

export function calculateLT(inputs: LTCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const vsdBase = Math.min(grossIncome, LT_VSD_ANNUAL_CAP);
  const vsdEmployee = roundCurrency(vsdBase * LT_VSD_EMPLOYEE_RATE);
  const grossAfterVsd = Math.max(0, grossIncome - vsdEmployee);
  const pensionLimit = getLithuanianPensionDeductionLimit(grossAfterVsd);
  const pensionDeduction = clampAmount(
    inputs.contributions?.pensionDeduction,
    pensionLimit,
  );
  const taxableIncome = roundCurrency(Math.max(0, grossAfterVsd - pensionDeduction));
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    LT_GPM_BRACKETS_2026,
  );

  const taxes: LTTaxBreakdown = {
    type: "LT",
    totalIncomeTax: incomeTax,
    incomeTax,
    vsdEmployee,
  };
  const totalTax = incomeTax + vsdEmployee;
  const totalDeductions = totalTax + pensionDeduction;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: LTBreakdown = {
    type: "LT",
    grossIncome,
    vsd: {
      rate: LT_VSD_EMPLOYEE_RATE,
      base: vsdBase,
      employee: vsdEmployee,
      annualCap: LT_VSD_ANNUAL_CAP,
    },
    taxableIncome,
    bracketTaxes,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      pensionDeduction,
      pensionDeductionLimit: pensionLimit,
      total: pensionDeduction,
    },
    assumptions: [
      "Employee VSD 19.5% capped at EUR 138,729; progressive GPM on income after VSD.",
      "Pension/life insurance deduction up to EUR 1,500 and 25% of income after VSD for qualifying contracts.",
    ],
    sourceUrls: Object.values(LT_SOURCE_URLS),
  };

  return {
    country: "LT",
    currency: "EUR",
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

export const LTCalculator: CountryCalculator = {
  countryCode: "LT",
  config: LT_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "LT") throw new Error("LTCalculator can only calculate LT inputs");
    return calculateLT(inputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = Math.max(0, (inputs as LTCalculatorInputs | undefined)?.grossSalary ?? 36_000);
    const vsd = Math.min(gross, LT_VSD_ANNUAL_CAP) * LT_VSD_EMPLOYEE_RATE;
    const limit = getLithuanianPensionDeductionLimit(Math.max(0, gross - vsd));
    return {
      pensionDeduction: {
        limit,
        name: "Pension fund / life insurance",
        description:
          "Combined deduction up to EUR 1,500 and 25% of income after VSD for qualifying III-pillar contracts.",
        preTax: true,
      },
    };
  },
  getDefaultInputs(): LTCalculatorInputs {
    return {
      country: "LT",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: { pensionDeduction: 0 },
    };
  },
};
