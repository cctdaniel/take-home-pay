import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
  TaxBracket,
} from "../types";
import { IE_CONFIG } from "./config";
import { IE_TAX_CONFIG } from "./constants/tax-year-2026";
import type {
  IEBreakdown,
  IECalculatorInputs,
  IETaxBreakdown,
  IETaxStatus,
} from "./types";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";


interface IETaxStatusConfig {
  name: string;
  standardRateBand: number;
  taxCredit: number;
}
interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  pensionReliefPercent: number;
  taxStatuses: Record<IETaxStatus, IETaxStatusConfig>;
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
const USC_EXEMPTION_LIMIT = 13_000;
function calculateUniversalSocialCharge(grossSalary: number): number {
  if (grossSalary <= USC_EXEMPTION_LIMIT) return 0;
  return calculateBracketTax(grossSalary, [
    { min: 0, max: 12_012, rate: 0.005 },
    { min: 12_012, max: 27_382, rate: 0.02 },
    { min: 27_382, max: 70_044, rate: 0.03 },
    { min: 70_044, max: Infinity, rate: 0.08 },
  ]).total;
}
const taxConfig = IE_TAX_CONFIG as LocalSalaryTaxConfig;
function getIncomeTaxBrackets(status: IETaxStatus): TaxBracket[] {
  const standardRateBand = taxConfig.taxStatuses[status].standardRateBand;
  return [
    { min: 0, max: standardRateBand, rate: 0.2 },
    { min: standardRateBand, max: Infinity, rate: 0.4 },
  ];
}
export function calculateIE(inputs: IECalculatorInputs): CalculationResult {
  const taxStatus = inputs.taxStatus ?? "single";
  const pensionLimit = roundCurrency(
    inputs.grossSalary * taxConfig.pensionReliefPercent,
  );
  const pensionContribution = roundCurrency(
    clampAmount(inputs.contributions.pensionContribution, 0, pensionLimit),
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
    getIncomeTaxBrackets(taxStatus),
  );
  const taxCredit = roundCurrency(
    clampAmount(
      taxConfig.taxStatuses[taxStatus].taxCredit,
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = calculateUniversalSocialCharge(
    inputs.grossSalary,
  );
  const totalTax = roundCurrency(
    incomeTax +
      additionalIncomeTax +
      employeeSocialContribution +
      pensionContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalTax);
  const taxes: IETaxBreakdown = {
    type: "IE",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax),
    incomeTax,
    employeeSocialContribution,
    additionalIncomeTax,
  };
  const breakdown: IEBreakdown = {
    type: "IE",
    grossIncome: inputs.grossSalary,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    taxStatus,
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
      name: "Universal Social Charge (USC)",
      amount: additionalIncomeTax,
      rate: 0,
    },
    assumptions: taxConfig.assumptions,
    sourceUrls: taxConfig.sourceUrls,
  };
  return {
    country: "IE",
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
export const IECalculator: CountryCalculator = {
  countryCode: "IE",
  config: IE_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IE")
      throw new Error("IECalculator can only calculate IE inputs");
    return calculateIE(inputs as IECalculatorInputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(inputs?: CalculatorInputs): ContributionLimits {
    const grossSalary =
      inputs?.country === "IE" ? inputs.grossSalary : taxConfig.defaultSalary;
    return {
      pensionContribution: {
        limit: roundCurrency(grossSalary * taxConfig.pensionReliefPercent),
        name: "Pension contribution",
        description:
          "Optional pension contribution with income-tax relief up to the modeled age-band cap proxy",
        preTax: true,
      },
    };
  },
  getDefaultInputs(): IECalculatorInputs {
    return {
      country: "IE",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      taxStatus: "single",
      contributions: { pensionContribution: 0 },
    };
  },
};
