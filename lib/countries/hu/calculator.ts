import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { HU_CONFIG } from "./config";
import {
  HU_FAMILY_ALLOWANCE_MONTHLY_PER_CHILD,
  HU_PIT_RATE,
  HU_SOCIAL_SECURITY_EMPLOYEE_RATE,
  HU_SOURCE_URLS,
  HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
} from "./constants/tax-year-2026";
import type { HUBreakdown, HUCalculatorInputs, HUTaxBreakdown } from "./types";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value);
}

export function calculateHU(inputs: HUCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const children = Math.max(0, Math.floor(inputs.numberOfChildren));
  const voluntaryPension = clampAmount(
    inputs.contributions?.voluntaryPension,
    HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
  );
  const familyAllowance = roundCurrency(
    children * HU_FAMILY_ALLOWANCE_MONTHLY_PER_CHILD * 12,
  );
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - familyAllowance - voluntaryPension),
  );
  const incomeTax = inputs.under25FullExemption
    ? 0
    : roundCurrency(taxableIncome * HU_PIT_RATE);
  const socialSecurity = roundCurrency(
    grossIncome * HU_SOCIAL_SECURITY_EMPLOYEE_RATE,
  );

  const taxes: HUTaxBreakdown = {
    type: "HU",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax + voluntaryPension;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: HUBreakdown = {
    type: "HU",
    grossIncome,
    familyAllowance,
    taxableIncome,
    under25FullExemption: inputs.under25FullExemption,
    numberOfChildren: children,
    incomeTax: {
      rate: HU_PIT_RATE,
      total: incomeTax,
    },
    socialSecurity: {
      rate: HU_SOCIAL_SECURITY_EMPLOYEE_RATE,
      total: socialSecurity,
    },
    voluntaryContributions: {
      voluntaryPension,
      voluntaryPensionLimit: HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
      total: voluntaryPension,
    },
    assumptions: [
      "Flat 15% personal income tax on taxable salary after family tax base allowance.",
      "Employee TB/social security modeled at 18.5% of gross salary.",
      "Family allowance uses HUF 66,670/month per child for 2026.",
      "Voluntary pension fund contributions up to HUF 1,560,000/year reduce the PIT base.",
      "Under-25 full PIT exemption is optional and does not remove social security.",
    ],
    sourceUrls: Object.values(HU_SOURCE_URLS),
  };

  return {
    country: "HU",
    currency: "HUF",
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

export const HUCalculator: CountryCalculator = {
  countryCode: "HU",
  config: HU_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "HU") {
      throw new Error("HUCalculator can only calculate HU inputs");
    }
    return calculateHU(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryPension: {
        limit: HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026,
        name: "Voluntary pension fund",
        description:
          "Önkéntes nyugdíjpénztár contribution reducing PIT base before 15%",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): HUCalculatorInputs {
    return {
      country: "HU",
      grossSalary: 10_000_000,
      payFrequency: "monthly",
      numberOfChildren: 0,
      under25FullExemption: false,
      contributions: {
        voluntaryPension: 0,
      },
    };
  },
};
