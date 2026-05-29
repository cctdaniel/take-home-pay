import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
  TaxBracket,
} from "../types";
import { IT_CONFIG } from "./config";
import { IT_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ITBreakdown, ITCalculatorInputs, ITTaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";


interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  additionalFlatIncomeTaxName?: string;
  additionalFlatIncomeTaxRate?: number;
  pensionDeductionLimit: number;
  taxCredit?: number | ((grossSalary: number, taxableIncome: number) => number);
  brackets: TaxBracket[];
  assumptions: string[];
  sourceUrls: string[];
}
function calculateBracketTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): {
  total: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
} {
  let total = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) continue;
    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const amountInBracket = Math.min(taxableIncome, upper) - bracket.min;
    if (amountInBracket <= 0) continue;
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
const taxConfig = IT_TAX_CONFIG as LocalSalaryTaxConfig;
export function calculateIT(inputs: ITCalculatorInputs): CalculationResult {
  const pensionContribution = roundCurrency(
    clampAmount(
      inputs.contributions.pensionContribution,
      0,
      taxConfig.pensionDeductionLimit,
    ),
  );
  const pensionDeduction = pensionContribution;
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
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      inputs.grossSalary -
        standardDeduction -
        pensionDeduction -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateBracketTax(
    taxableIncome,
    taxConfig.brackets,
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
    incomeTax +
      additionalIncomeTax +
      employeeSocialContribution +
      pensionContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalTax);
  const taxes: ITTaxBreakdown = {
    type: "IT",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax),
    incomeTax,
    employeeSocialContribution,
    additionalIncomeTax,
  };
  const breakdown: ITBreakdown = {
    type: "IT",
    grossIncome: inputs.grossSalary,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    pensionContribution,
    pensionDeduction,
    disallowedPensionContribution: 0,
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
    country: "IT",
    currency: "EUR",
    grossSalary: inputs.grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate:
      inputs.grossSalary > 0 ? totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}
export const ITCalculator: CountryCalculator = {
  countryCode: "IT",
  config: IT_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IT")
      throw new Error("ITCalculator can only calculate IT inputs");
    return calculateIT(inputs as ITCalculatorInputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(): ContributionLimits {
    return {
      pensionContribution: {
        limit: taxConfig.pensionDeductionLimit,
        name: "Supplementary pension",
        description:
          "Optional supplementary pension contribution deductible up to the modeled annual limit",
        preTax: true,
      },
    };
  },
  getDefaultInputs(): ITCalculatorInputs {
    return {
      country: "IT",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      contributions: { pensionContribution: 0 },
    };
  },
};
