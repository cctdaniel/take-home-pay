import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { FR_CONFIG } from "./config";
import { FR_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FRBreakdown, FRCalculatorInputs, FRTaxBreakdown } from "./types";

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  additionalFlatIncomeTaxName?: string;
  additionalFlatIncomeTaxRate?: number;
  taxCredit?: number | ((grossSalary: number, taxableIncome: number) => number);
  retirementSavingsLimit: number;
  brackets: TaxBracket[];
  assumptions: string[];
  sourceUrls: string[];
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

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

function clampAmount(value: number, min = 0, max = Infinity): number {
  return Math.min(Math.max(value, min), max);
}

function calculateBracketTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): { total: number; bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }> } {
  let total = 0;
  const bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }> = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      continue;
    }

    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const amountInBracket = Math.min(taxableIncome, upper) - bracket.min;

    if (amountInBracket <= 0) {
      continue;
    }

    const tax = roundCurrency(amountInBracket * bracket.rate);
    total += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax,
    });
  }

  return { total: roundCurrency(total), bracketTaxes };
}

const taxConfig = FR_TAX_CONFIG as LocalSalaryTaxConfig;

function calculateIncomeTaxWithHouseholdParts(
  taxableIncome: number,
  householdParts: number,
): { total: number; bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }> } {
  const parts = clampAmount(householdParts, 1, 6);
  const quotientIncome = taxableIncome / parts;
  const quotientTax = calculateBracketTax(quotientIncome, taxConfig.brackets);

  return {
    total: roundCurrency(quotientTax.total * parts),
    bracketTaxes: quotientTax.bracketTaxes.map((bracket) => ({
      ...bracket,
      min: roundCurrency(bracket.min * parts),
      max: Number.isFinite(bracket.max) ? roundCurrency(bracket.max * parts) : bracket.max,
      tax: roundCurrency(bracket.tax * parts),
    })),
  };
}

export function calculateFR(inputs: FRCalculatorInputs): CalculationResult {
  const employeeSocialBase = Math.min(
    inputs.grossSalary,
    taxConfig.employeeSocialCap ?? inputs.grossSalary,
  );
  const employeeSocialContribution = roundCurrency(
    employeeSocialBase * taxConfig.employeeSocialRate,
  );
  const standardDeduction = roundCurrency(
    typeof taxConfig.standardDeduction === "function"
      ? taxConfig.standardDeduction(inputs.grossSalary)
      : taxConfig.standardDeduction,
  );
  const retirementSavingsContribution = roundCurrency(
    clampAmount(inputs.contributions.retirementSavings ?? 0, 0, taxConfig.retirementSavingsLimit),
  );
  const retirementSavingsDeduction = retirementSavingsContribution;
  const disallowedRetirementSavings = roundCurrency(
    Math.max(0, (inputs.contributions.retirementSavings ?? 0) - retirementSavingsDeduction),
  );
  const taxHouseholdParts = clampAmount(inputs.taxHouseholdParts, 1, 6);
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      inputs.grossSalary -
        standardDeduction -
        retirementSavingsDeduction -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateIncomeTaxWithHouseholdParts(
    taxableIncome,
    taxHouseholdParts,
  );
  const taxCredit = roundCurrency(
    clampAmount(
      typeof taxConfig.taxCredit === "function"
        ? taxConfig.taxCredit(inputs.grossSalary, taxableIncome)
        : (taxConfig.taxCredit ?? 0),
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = roundCurrency(
    taxableIncome * (taxConfig.additionalFlatIncomeTaxRate ?? 0),
  );

  const totalTax = roundCurrency(
    incomeTax + additionalIncomeTax + employeeSocialContribution + retirementSavingsContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalTax);

  const taxes: FRTaxBreakdown = {
    type: "FR",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax),
    incomeTax,
    employeeSocialContribution,
    additionalIncomeTax,
  };

  const breakdown: FRBreakdown = {
    type: "FR",
    grossIncome: inputs.grossSalary,
    taxableIncome,
    standardDeduction,
    retirementSavingsDeduction,
    disallowedRetirementSavings,
    taxHouseholdParts,
    bracketTaxes,
    taxCredit,
    employeeSocialContribution: {
      name: taxConfig.employeeSocialName,
      amount: employeeSocialContribution,
      rate: taxConfig.employeeSocialRate,
      cap: taxConfig.employeeSocialCap,
    },
    additionalIncomeTax: {
      name: taxConfig.additionalFlatIncomeTaxName ?? "Additional income tax",
      amount: additionalIncomeTax,
      rate: taxConfig.additionalFlatIncomeTaxRate ?? 0,
    },
    assumptions: taxConfig.assumptions,
    sourceUrls: taxConfig.sourceUrls,
  };

  return {
    country: "FR",
    currency: "EUR",
    grossSalary: inputs.grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate: inputs.grossSalary > 0 ? totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const FRCalculator: CountryCalculator = {
  countryCode: "FR",
  config: FR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "FR") {
      throw new Error("FRCalculator can only calculate FR inputs");
    }

    return calculateFR(inputs as FRCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      retirementSavings: {
        limit: taxConfig.retirementSavingsLimit,
        name: "PER retirement savings",
        description: "Optional French PER-style retirement savings deductible from taxable income up to the modeled annual cap.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): FRCalculatorInputs {
    return {
      country: "FR",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      taxHouseholdParts: 1,
      contributions: {
        retirementSavings: 0,
      },
    };
  },
};
