import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { EE_CONFIG } from "./config";
import {
  calculateEstonianBasicAllowance,
  EE_INCOME_TAX_RATE,
  EE_PENSION_EMPLOYEE_RATE,
  EE_SOURCE_URLS,
  EE_THIRD_PILLAR_ANNUAL_CAP_2026,
  EE_THIRD_PILLAR_MAX_GROSS_RATE,
  EE_UNEMPLOYMENT_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { EEBreakdown, EECalculatorInputs, EETaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function getThirdPillarLimit(grossIncome: number): number {
  return Math.min(
    Math.max(0, grossIncome) * EE_THIRD_PILLAR_MAX_GROSS_RATE,
    EE_THIRD_PILLAR_ANNUAL_CAP_2026,
  );
}

export function calculateEE(inputs: EECalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const thirdPillarLimit = getThirdPillarLimit(grossIncome);
  const thirdPillar = clampAmount(
    inputs.contributions?.thirdPillar,
    thirdPillarLimit,
  );
  const basicAllowance = roundCurrency(calculateEstonianBasicAllowance(grossIncome));
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - basicAllowance - thirdPillar),
  );
  const incomeTax = roundCurrency(taxableIncome * EE_INCOME_TAX_RATE);
  const pensionEmployee = roundCurrency(grossIncome * EE_PENSION_EMPLOYEE_RATE);
  const unemploymentEmployee = roundCurrency(
    grossIncome * EE_UNEMPLOYMENT_EMPLOYEE_RATE,
  );

  const taxes: EETaxBreakdown = {
    type: "EE",
    totalIncomeTax: incomeTax,
    incomeTax,
    pensionEmployee,
    unemploymentEmployee,
  };
  const totalTax = incomeTax + pensionEmployee + unemploymentEmployee;
  const totalDeductions = totalTax + thirdPillar;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: EEBreakdown = {
    type: "EE",
    grossIncome,
    basicAllowance,
    taxableIncome,
    incomeTax: {
      rate: EE_INCOME_TAX_RATE,
      total: incomeTax,
    },
    pension: {
      employeeRate: EE_PENSION_EMPLOYEE_RATE,
      employee: pensionEmployee,
    },
    unemployment: {
      employeeRate: EE_UNEMPLOYMENT_EMPLOYEE_RATE,
      employee: unemploymentEmployee,
    },
    voluntaryContributions: {
      thirdPillar,
      thirdPillarLimit,
      total: thirdPillar,
    },
    assumptions: [
      "Models resident employment salary with phased basic allowance, flat 22% income tax, 2% funded pension, and 1.6% unemployment insurance.",
      "Basic allowance phases out between EUR 12,000 and EUR 25,200 annual gross.",
      "Third pillar contributions up to min(15% gross, EUR 6,000) reduce the income tax base and net salary.",
    ],
    sourceUrls: Object.values(EE_SOURCE_URLS),
  };

  return {
    country: "EE",
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

export const EECalculator: CountryCalculator = {
  countryCode: "EE",
  config: EE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "EE") {
      throw new Error("EECalculator can only calculate EE inputs");
    }
    return calculateEE(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: EECalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 36_000;
    return {
      thirdPillar: {
        limit: getThirdPillarLimit(gross),
        name: "Third pillar pension",
        description:
          "Deductible third-pillar contribution up to 15% of gross or EUR 6,000",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): EECalculatorInputs {
    return {
      country: "EE",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {
        thirdPillar: 0,
      },
    };
  },
};
