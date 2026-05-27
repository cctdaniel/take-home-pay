import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { BE_CONFIG } from "./config";
import {
  BE_EXPAT_REGIME_2026,
  BE_TAX_CONFIG,
  getBEExpatAllowanceLimit,
  getBEExpatSocialSecurityExemptLimit,
} from "./constants/tax-year-2026";
import type {
  BEBreakdown,
  BECalculatorInputs,
  BEExpatRegimeType,
  BETaxBreakdown,
} from "./types";

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  personalTaxAllowance: number;
  dependentChildAllowances: {
    one: number;
    two: number;
    three: number;
    four: number;
    eachAdditional: number;
    underThreeNoChildcare: number;
    singleParent: number;
  };
  standardDeduction: number | ((grossSalary: number) => number);
  employeeSocialRate: number;
  employeeSocialCap?: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
  additionalFlatIncomeTaxName?: string;
  additionalFlatIncomeTaxRate?: number;
  pensionSavingsLimit: number;
  pensionSavingsTaxCreditRate: number;
  childcareTaxReductionRate: number;
  childcareDailyExpenseLimit: number;
  childcareMaxDaysPerChild: number;
  charitableDonationTaxReductionRate: number;
  charitableDonationMinimum: number;
  charitableDonationNetIncomeLimitRate: number;
  charitableDonationAbsoluteLimit: number;
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

function normalizeExpatRegimeType(
  expatRegimeType: BEExpatRegimeType | undefined,
): BEExpatRegimeType {
  return expatRegimeType === "inboundTaxpayer" ||
    expatRegimeType === "inboundResearcher"
    ? expatRegimeType
    : "none";
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

const taxConfig = BE_TAX_CONFIG as LocalSalaryTaxConfig;

function calculateDependentChildAllowance(inputs: BECalculatorInputs): number {
  const children = Math.min(
    Math.max(0, Math.floor(inputs.numberOfDependentChildren ?? 0)),
    10,
  );
  const youngChildren = Math.min(
    children,
    Math.max(0, Math.floor(inputs.numberOfChildrenUnderThreeNoChildcare ?? 0)),
  );
  const allowances = taxConfig.dependentChildAllowances;
  let childAllowance = 0;

  if (children === 1) {
    childAllowance = allowances.one;
  } else if (children === 2) {
    childAllowance = allowances.two;
  } else if (children === 3) {
    childAllowance = allowances.three;
  } else if (children >= 4) {
    childAllowance =
      allowances.four + Math.max(0, children - 4) * allowances.eachAdditional;
  }

  return (
    childAllowance +
    youngChildren * allowances.underThreeNoChildcare +
    (inputs.isSingleParentWithChildren && children > 0
      ? allowances.singleParent
      : 0)
  );
}

function calculatePersonalTaxAllowance(inputs: BECalculatorInputs): number {
  return taxConfig.personalTaxAllowance + calculateDependentChildAllowance(inputs);
}

function calculateChildcareDays(inputs: Partial<BECalculatorInputs>): number {
  const children = Math.min(
    Math.max(0, Math.floor(inputs.numberOfDependentChildren ?? 0)),
    10,
  );
  const maxDays = children * taxConfig.childcareMaxDaysPerChild;
  return Math.min(
    Math.max(0, Math.floor(inputs.childcareDays ?? 0)),
    maxDays,
  );
}

function calculateChildcareExpenseLimit(
  inputs: Partial<BECalculatorInputs>,
): number {
  return roundCurrency(
    calculateChildcareDays(inputs) * taxConfig.childcareDailyExpenseLimit,
  );
}

function calculateTaxableIncomeProxy(
  inputs: Partial<BECalculatorInputs>,
): number {
  const grossSalary = roundCurrency(
    Math.max(0, inputs.grossSalary ?? taxConfig.defaultSalary),
  );
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxableEmploymentIncome = roundCurrency(
    grossSalary + taxableBenefitsInKind,
  );
  const expatRegimeType = normalizeExpatRegimeType(inputs.expatRegimeType);
  const expatRecurringAllowance = roundCurrency(
    clampAmount(
      inputs.expatRecurringAllowance ?? 0,
      0,
      getBEExpatAllowanceLimit(taxableEmploymentIncome, expatRegimeType),
    ),
  );
  const expatSocialSecurityExemptAllowance = roundCurrency(
    clampAmount(
      expatRecurringAllowance,
      0,
      getBEExpatSocialSecurityExemptLimit(
        taxableEmploymentIncome,
        expatRegimeType,
      ),
    ),
  );
  const expatSocialSecurityTaxableAllowance = roundCurrency(
    Math.max(0, expatRecurringAllowance - expatSocialSecurityExemptAllowance),
  );
  const employeeSocialBase = Math.min(
    taxableEmploymentIncome + expatSocialSecurityTaxableAllowance,
    taxConfig.employeeSocialCap ??
      taxableEmploymentIncome + expatSocialSecurityTaxableAllowance,
  );
  const employeeSocialContribution = roundCurrency(
    employeeSocialBase * taxConfig.employeeSocialRate,
  );
  const standardDeduction = roundCurrency(
    typeof taxConfig.standardDeduction === "function"
      ? taxConfig.standardDeduction(taxableEmploymentIncome)
      : taxConfig.standardDeduction,
  );

  return roundCurrency(
    Math.max(
      0,
      taxableEmploymentIncome -
        standardDeduction -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
}

function calculateCharitableDonationLimit(
  inputs: Partial<BECalculatorInputs>,
): number {
  return roundCurrency(
    Math.min(
      calculateTaxableIncomeProxy(inputs) *
        taxConfig.charitableDonationNetIncomeLimitRate,
      taxConfig.charitableDonationAbsoluteLimit,
    ),
  );
}

export function calculateBE(inputs: BECalculatorInputs): CalculationResult {
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxableEmploymentIncome = roundCurrency(
    inputs.grossSalary + taxableBenefitsInKind,
  );
  const expatRegimeType = normalizeExpatRegimeType(inputs.expatRegimeType);
  const expatAllowanceLimit = roundCurrency(
    getBEExpatAllowanceLimit(taxableEmploymentIncome, expatRegimeType),
  );
  const expatRecurringAllowance = roundCurrency(
    clampAmount(inputs.expatRecurringAllowance ?? 0, 0, expatAllowanceLimit),
  );
  const expatSocialSecurityExemptAllowance = roundCurrency(
    clampAmount(
      expatRecurringAllowance,
      0,
      getBEExpatSocialSecurityExemptLimit(
        taxableEmploymentIncome,
        expatRegimeType,
      ),
    ),
  );
  const expatSocialSecurityTaxableAllowance = roundCurrency(
    Math.max(0, expatRecurringAllowance - expatSocialSecurityExemptAllowance),
  );
  const expatTaxpayerMinimumMet =
    expatRegimeType !== "inboundTaxpayer" ||
    taxableEmploymentIncome >=
      BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary;
  const pensionSavingsContribution = roundCurrency(
    clampAmount(
      inputs.contributions.pensionSavings ?? 0,
      0,
      taxConfig.pensionSavingsLimit,
    ),
  );
  const childcareDays = calculateChildcareDays(inputs);
  const childcareExpenseLimit = calculateChildcareExpenseLimit(inputs);
  const childcareExpenses = roundCurrency(
    clampAmount(
      inputs.contributions.childcareExpenses ?? 0,
      0,
      childcareExpenseLimit,
    ),
  );
  const charitableDonationLimit = calculateCharitableDonationLimit(inputs);
  const charitableDonationAmount = roundCurrency(
    clampAmount(
      inputs.contributions.charitableDonations ?? 0,
      0,
      charitableDonationLimit,
    ),
  );
  const charitableDonations =
    charitableDonationAmount >= taxConfig.charitableDonationMinimum
      ? charitableDonationAmount
      : 0;
  const grossCashCompensation = roundCurrency(
    inputs.grossSalary + expatRecurringAllowance,
  );
  const employeeSocialBase = Math.min(
    taxableEmploymentIncome + expatSocialSecurityTaxableAllowance,
    taxConfig.employeeSocialCap ??
      taxableEmploymentIncome + expatSocialSecurityTaxableAllowance,
  );
  const employeeSocialContribution = roundCurrency(
    employeeSocialBase * taxConfig.employeeSocialRate,
  );
  const standardDeduction = roundCurrency(
    typeof taxConfig.standardDeduction === "function"
      ? taxConfig.standardDeduction(taxableEmploymentIncome)
      : taxConfig.standardDeduction,
  );
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      taxableEmploymentIncome -
        standardDeduction -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateBracketTax(
    taxableIncome,
    taxConfig.brackets,
  );
  const personalTaxAllowance = calculatePersonalTaxAllowance(inputs);
  const personalTaxAllowanceCredit = roundCurrency(
    clampAmount(
      calculateBracketTax(personalTaxAllowance, taxConfig.brackets).total,
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const baseTaxCredit = roundCurrency(
    clampAmount(
      personalTaxAllowanceCredit +
        (typeof taxConfig.taxCredit === "function"
          ? taxConfig.taxCredit(inputs.grossSalary, taxableIncome)
          : (taxConfig.taxCredit ?? 0)),
      0,
      incomeTaxBeforeCredits,
    ),
  );
  const pensionSavingsTaxCredit = roundCurrency(
    clampAmount(
      pensionSavingsContribution * taxConfig.pensionSavingsTaxCreditRate,
      0,
      Math.max(0, incomeTaxBeforeCredits - baseTaxCredit),
    ),
  );
  const childcareTaxReduction = roundCurrency(
    clampAmount(
      childcareExpenses * taxConfig.childcareTaxReductionRate,
      0,
      Math.max(0, incomeTaxBeforeCredits - baseTaxCredit - pensionSavingsTaxCredit),
    ),
  );
  const charitableDonationTaxReduction = roundCurrency(
    clampAmount(
      charitableDonations * taxConfig.charitableDonationTaxReductionRate,
      0,
      Math.max(
        0,
        incomeTaxBeforeCredits -
          baseTaxCredit -
          pensionSavingsTaxCredit -
          childcareTaxReduction,
      ),
    ),
  );
  const taxCredit = roundCurrency(
    baseTaxCredit +
      pensionSavingsTaxCredit +
      childcareTaxReduction +
      charitableDonationTaxReduction,
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = roundCurrency(
    incomeTax * (taxConfig.additionalFlatIncomeTaxRate ?? 0),
  );
  const totalTax = roundCurrency(
    incomeTax +
      additionalIncomeTax +
      employeeSocialContribution +
      pensionSavingsContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(grossCashCompensation - totalTax);
  const taxes: BETaxBreakdown = {
    type: "BE",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax),
    incomeTax,
    employeeSocialContribution,
    additionalIncomeTax,
  };
  const breakdown: BEBreakdown = {
    type: "BE",
    grossIncome: inputs.grossSalary,
    grossCashCompensation,
    taxableBenefitsInKind,
    taxableEmploymentIncome,
    taxableIncome,
    standardDeduction,
    personalTaxAllowance,
    personalTaxAllowanceCredit,
    bracketTaxes,
    taxCredit,
    expatRegimeType,
    expatRecurringAllowance,
    expatAllowanceLimit,
    expatSocialSecurityExemptAllowance,
    expatTaxpayerMinimumSalary:
      BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary,
    expatTaxpayerMinimumMet,
    pensionSavingsContribution,
    pensionSavingsTaxCredit,
    childcareDays,
    childcareExpenseLimit,
    childcareExpenses,
    childcareTaxReduction,
    charitableDonationLimit,
    charitableDonations,
    charitableDonationTaxReduction,
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
    country: "BE",
    currency: "EUR",
    grossSalary: inputs.grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate:
      grossCashCompensation > 0 ? totalTax / grossCashCompensation : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const BECalculator: CountryCalculator = {
  countryCode: "BE",
  config: BE_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BE")
      throw new Error("BECalculator can only calculate BE inputs");
    return calculateBE(inputs as BECalculatorInputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const beInputs =
      inputs && inputs.country === "BE"
        ? (inputs as Partial<BECalculatorInputs>)
        : {};
    const childcareExpenseLimit = calculateChildcareExpenseLimit(beInputs);
    const charitableDonationLimit = calculateCharitableDonationLimit(beInputs);

    return {
      pensionSavings: {
        limit: taxConfig.pensionSavingsLimit,
        name: "Pension savings",
        description:
          "Optional Belgian pension savings tax-reduction contribution",
        preTax: false,
      },
      childcareExpenses: {
        limit: childcareExpenseLimit,
        name: "Childcare expenses",
        description:
          "Eligible Belgian childcare costs capped per child per day for the 45% tax reduction",
        preTax: false,
      },
      charitableDonations: {
        limit: charitableDonationLimit,
        name: "Qualifying gifts / donations",
        description:
          "Approved gifts eligible for the Belgian donation tax reduction",
        preTax: false,
      },
    };
  },
  getDefaultInputs(): BECalculatorInputs {
    return {
      country: "BE",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      taxableBenefitsInKind: 0,
      numberOfDependentChildren: 0,
      numberOfChildrenUnderThreeNoChildcare: 0,
      childcareDays: 0,
      isSingleParentWithChildren: false,
      expatRegimeType: "none",
      expatRecurringAllowance: 0,
      contributions: {
        pensionSavings: 0,
        childcareExpenses: 0,
        charitableDonations: 0,
      },
    };
  },
};
