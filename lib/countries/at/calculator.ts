import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
  TaxBracket,
} from "../types";
import { AT_CONFIG } from "./config";
import { AT_TAX_CONFIG } from "./constants/tax-year-2026";
import type {
  ATBreakdown,
  ATCalculatorInputs,
  ATFamilyBonusChildren,
  ATTaxBreakdown,
} from "./types";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";


interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  commuterAllowanceLimit: number;
  familyBonusPlusPerChild: number;
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  additionalFlatIncomeTaxName?: string;
  additionalFlatIncomeTaxRate?: number;
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
const taxConfig = AT_TAX_CONFIG as LocalSalaryTaxConfig;
export function calculateAT(inputs: ATCalculatorInputs): CalculationResult {
  const commuterAllowance = roundCurrency(
    clampAmount(
      inputs.contributions.commuterAllowance,
      0,
      taxConfig.commuterAllowanceLimit,
    ),
  );
  const familyBonusChildren = Math.trunc(
    clampAmount(inputs.familyBonusChildren, 0, 4),
  ) as ATFamilyBonusChildren;
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
        commuterAllowance -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateBracketTax(
    taxableIncome,
    taxConfig.brackets,
  );
  const baseTaxCredit = roundCurrency(
    clampAmount(
      typeof taxConfig.taxCredit === "function"
        ? taxConfig.taxCredit(inputs.grossSalary, taxableIncome)
        : (taxConfig.taxCredit ?? 0),
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const familyBonusPlusCredit = roundCurrency(
    clampAmount(
      familyBonusChildren * taxConfig.familyBonusPlusPerChild,
      0,
      incomeTaxBeforeCredits - baseTaxCredit,
    ),
  );
  const taxCredit = roundCurrency(baseTaxCredit + familyBonusPlusCredit);
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = roundCurrency(
    taxableIncome * (taxConfig.additionalFlatIncomeTaxRate ?? 0),
  );
  const totalTax = roundCurrency(
    incomeTax + additionalIncomeTax + employeeSocialContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalTax);
  const taxes: ATTaxBreakdown = {
    type: "AT",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax),
    incomeTax,
    employeeSocialContribution,
    additionalIncomeTax,
  };
  const breakdown: ATBreakdown = {
    type: "AT",
    grossIncome: inputs.grossSalary,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    commuterAllowance,
    familyBonusChildren,
    familyBonusPlusCredit,
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
    country: "AT",
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
export const ATCalculator: CountryCalculator = {
  countryCode: "AT",
  config: AT_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AT")
      throw new Error("ATCalculator can only calculate AT inputs");
    return calculateAT(inputs as ATCalculatorInputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(): ContributionLimits {
    return {
      commuterAllowance: {
        limit: taxConfig.commuterAllowanceLimit,
        name: "Commuter allowance",
        description: "Optional Austrian commuter allowance deduction proxy",
        preTax: true,
      },
    };
  },
  getDefaultInputs(): ATCalculatorInputs {
    return {
      country: "AT",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      familyBonusChildren: 0,
      contributions: { commuterAllowance: 0 },
    };
  },
};
