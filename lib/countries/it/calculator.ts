import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { IT_CONFIG } from "./config";
import {
  calculateItalyAscendantCredit,
  calculateItalyDependentSpouseCredit,
  calculateItalyEligibleChildCredit,
  IT_IMPATRIATE_REGIME_2026,
  IT_LOCAL_ADD_ON_RATE_LIMITS_2026,
  IT_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { ITBreakdown, ITCalculatorInputs, ITTaxBreakdown } from "./types";

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  additionalFlatIncomeTaxName?: string;
  additionalFlatIncomeTaxRate?: number;
  localAddOnRateLimits?: {
    defaultRate: number;
    minRate: number;
    maxRate: number;
  };
  pensionDeductionLimit: number;
  taxCredit?: number | ((grossSalary: number, taxableIncome: number) => number);
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
function clampInteger(value: number, min = 0, max = Infinity): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.trunc(value), min), max);
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
  const localAddOnRateLimits =
    taxConfig.localAddOnRateLimits ?? IT_LOCAL_ADD_ON_RATE_LIMITS_2026;
  const localAddOnRate = clampAmount(
    inputs.localAddOnRate ?? localAddOnRateLimits.defaultRate,
    localAddOnRateLimits.minRate,
    localAddOnRateLimits.maxRate,
  );
  const taxableFringeBenefits = roundCurrency(
    Math.max(0, inputs.taxableFringeBenefits ?? 0),
  );
  const taxableGrossIncome = roundCurrency(
    inputs.grossSalary + taxableFringeBenefits,
  );
  const pensionContribution = roundCurrency(
    clampAmount(
      inputs.contributions.pensionContribution,
      0,
      taxConfig.pensionDeductionLimit,
    ),
  );
  const pensionDeduction = pensionContribution;
  const employeeSocialBase = Math.min(
    taxableGrossIncome,
    taxConfig.employeeSocialCap ?? taxableGrossIncome,
  );
  const employeeSocialContribution = roundCurrency(
    employeeSocialBase * taxConfig.employeeSocialRate,
  );
  const standardDeduction = roundCurrency(
    typeof taxConfig.standardDeduction === "function"
      ? taxConfig.standardDeduction(taxableGrossIncome)
      : taxConfig.standardDeduction,
  );
  const impatriateTaxableShare =
    inputs.impatriateRegime === "standard"
      ? IT_IMPATRIATE_REGIME_2026.standardTaxableShare
      : inputs.impatriateRegime === "minorChild"
        ? IT_IMPATRIATE_REGIME_2026.minorChildTaxableShare
        : 1;
  const impatriateEligibleIncome =
    inputs.impatriateRegime === "none"
      ? 0
      : Math.min(
          taxableGrossIncome,
          IT_IMPATRIATE_REGIME_2026.eligibleIncomeCap,
        );
  const impatriateIncomeExemption = roundCurrency(
    impatriateEligibleIncome * (1 - impatriateTaxableShare),
  );
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      taxableGrossIncome -
        standardDeduction -
        impatriateIncomeExemption -
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
  const employmentTaxCredit = roundCurrency(
    clampAmount(
      typeof taxConfig.taxCredit === "function"
        ? taxConfig.taxCredit(taxableGrossIncome, taxableIncome)
        : (taxConfig.taxCredit ?? 0),
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const dependentSpouseCredit = inputs.dependentSpouse
    ? calculateItalyDependentSpouseCredit(taxableIncome)
    : 0;
  const childCreditShare = inputs.childCreditShare === "half" ? 0.5 : 1;
  const eligibleChildren = clampInteger(inputs.eligibleChildren, 0, 20);
  const eligibleChildCredit = calculateItalyEligibleChildCredit(
    taxableIncome,
    eligibleChildren,
    childCreditShare,
  );
  const cohabitingAscendants = clampInteger(inputs.cohabitingAscendants, 0, 20);
  const ascendantCreditSharePercent = clampAmount(
    inputs.ascendantCreditSharePercent,
    0,
    100,
  );
  const ascendantCredit = calculateItalyAscendantCredit(
    taxableIncome,
    cohabitingAscendants,
    ascendantCreditSharePercent,
  );
  const familyCreditPotential = roundCurrency(
    dependentSpouseCredit + eligibleChildCredit + ascendantCredit,
  );
  const familyTaxCredit = roundCurrency(
    clampAmount(
      familyCreditPotential,
      0,
      Math.max(0, incomeTaxBeforeCredits - employmentTaxCredit),
    ),
  );
  const totalTaxCredits = roundCurrency(employmentTaxCredit + familyTaxCredit);
  const taxCredit = totalTaxCredits;
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - totalTaxCredits);
  const additionalIncomeTax = roundCurrency(taxableIncome * localAddOnRate);
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
    taxableFringeBenefits,
    taxableGrossIncome,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    employmentTaxCredit,
    familyTaxCredit,
    totalTaxCredits,
    familyCreditIncomeBase: taxableIncome,
    impatriateRegime: inputs.impatriateRegime ?? "none",
    impatriateIncomeExemption,
    impatriateEligibleIncome,
    familyCredits: {
      dependentSpouse: dependentSpouseCredit,
      eligibleChildren: eligibleChildCredit,
      cohabitingAscendants: ascendantCredit,
      totalPotential: familyCreditPotential,
      applied: familyTaxCredit,
      childCreditShare: inputs.childCreditShare ?? "full",
      ascendantCreditSharePercent,
    },
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
      rate: localAddOnRate,
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
      localAddOnRate:
        taxConfig.additionalFlatIncomeTaxRate ??
        IT_LOCAL_ADD_ON_RATE_LIMITS_2026.defaultRate,
      taxableFringeBenefits: 0,
      impatriateRegime: "none",
      dependentSpouse: false,
      eligibleChildren: 0,
      childCreditShare: "full",
      cohabitingAscendants: 0,
      ascendantCreditSharePercent: 100,
      contributions: { pensionContribution: 0 },
    };
  },
};
