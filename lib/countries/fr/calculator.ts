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
import {
  FR_DECOTE_2026,
  FR_FAMILY_QUOTIENT_CAP_2026,
  FR_GENERAL_DONATION_REDUCTION_2026,
  FR_IMPATRIATE_REGIME_2026,
  FR_LOW_TAX_COLLECTION_THRESHOLD,
  FR_TAX_CONFIG,
  calculateFRRetirementSavingsLimit,
  calculateFRStandardEmploymentDeduction,
} from "./constants/tax-year-2026";
import type {
  FRBreakdown,
  FRCalculatorInputs,
  FRHouseholdStatus,
  FRImpatriateRegime,
  FRTaxBreakdown,
} from "./types";

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  employeeSocialRate: number;
  employeeSocialName: string;
  deductEmployeeSocialBeforeIncomeTax: boolean;
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
  return Math.min(Math.max(value || 0, min), max);
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

function calculateChildParts(numberOfChildren: number) {
  const children = Math.max(0, Math.floor(numberOfChildren));
  return Math.min(children, 2) * 0.5 + Math.max(0, children - 2);
}

function calculateHouseholdParts(
  householdStatus: FRHouseholdStatus,
  numberOfChildren: number,
) {
  const childParts = calculateChildParts(numberOfChildren);
  const baseParts = householdStatus === "married_pacs" ? 2 : 1;
  const singleParentExtra =
    householdStatus === "single_parent" && numberOfChildren > 0 ? 0.5 : 0;

  return {
    baseParts,
    totalParts: Math.min(12, baseParts + childParts + singleParentExtra),
  };
}

function calculateTaxWithHouseholdParts(
  taxableIncome: number,
  householdParts: number,
): {
  total: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
} {
  const parts = clampAmount(householdParts, 1, 12);
  const quotientIncome = taxableIncome / parts;
  const quotientTax = calculateBracketTax(quotientIncome, taxConfig.brackets);

  return {
    total: roundCurrency(quotientTax.total * parts),
    bracketTaxes: quotientTax.bracketTaxes.map((bracket) => ({
      ...bracket,
      min: roundCurrency(bracket.min * parts),
      max: Number.isFinite(bracket.max)
        ? roundCurrency(bracket.max * parts)
        : bracket.max,
      tax: roundCurrency(bracket.tax * parts),
    })),
  };
}

function calculateFamilyQuotientCap(
  householdStatus: FRHouseholdStatus,
  baseParts: number,
  householdParts: number,
  numberOfChildren: number,
) {
  const additionalHalfParts = Math.max(
    0,
    Math.round((householdParts - baseParts) * 2),
  );

  if (
    householdStatus === "single_parent" &&
    numberOfChildren > 0 &&
    additionalHalfParts > 0
  ) {
    return (
      FR_FAMILY_QUOTIENT_CAP_2026.singleParentFirstChild +
      Math.max(0, additionalHalfParts - 2) *
        FR_FAMILY_QUOTIENT_CAP_2026.perHalfPart
    );
  }

  return additionalHalfParts * FR_FAMILY_QUOTIENT_CAP_2026.perHalfPart;
}

function calculateDecote(
  taxAfterQuotientCap: number,
  householdStatus: FRHouseholdStatus,
) {
  const isJoint = householdStatus === "married_pacs";
  const threshold = isJoint
    ? FR_DECOTE_2026.jointThreshold
    : FR_DECOTE_2026.singleThreshold;

  if (taxAfterQuotientCap <= 0 || taxAfterQuotientCap >= threshold) {
    return 0;
  }

  const amount = isJoint ? FR_DECOTE_2026.jointAmount : FR_DECOTE_2026.singleAmount;
  return roundCurrency(
    clampAmount(amount - taxAfterQuotientCap * FR_DECOTE_2026.rate, 0, taxAfterQuotientCap),
  );
}

function normalizeImpatriateRegime(
  impatriateRegime: FRImpatriateRegime | undefined,
): FRImpatriateRegime {
  return impatriateRegime === "forfait30" ||
    impatriateRegime === "actualPremium"
    ? impatriateRegime
    : "none";
}

function calculateImpatriateSalaryExemption(inputs: FRCalculatorInputs): {
  impatriateRegime: FRImpatriateRegime;
  impatriateSalaryExemption: number;
  impatriatePremiumLimit: number;
  impatriateForfaitPremium: number;
  impatriateActualPremium: number;
  frenchReferenceSalary: number;
  impatriateReferenceSalaryLimit: number;
} {
  const impatriateRegime = normalizeImpatriateRegime(inputs.impatriateRegime);
  const grossSalary = Math.max(0, inputs.grossSalary);
  const frenchReferenceSalary = roundCurrency(
    clampAmount(inputs.frenchReferenceSalary ?? 0, 0, grossSalary),
  );
  const globalPremiumLimit = roundCurrency(
    grossSalary * FR_IMPATRIATE_REGIME_2026.globalSalaryExemptionCapRate,
  );
  const impatriateReferenceSalaryLimit =
    frenchReferenceSalary > 0
      ? roundCurrency(Math.max(0, grossSalary - frenchReferenceSalary))
      : globalPremiumLimit;
  const impatriatePremiumLimit = roundCurrency(
    Math.min(globalPremiumLimit, impatriateReferenceSalaryLimit),
  );
  const impatriateForfaitPremium = roundCurrency(
    grossSalary * FR_IMPATRIATE_REGIME_2026.forfaitPremiumRate,
  );
  const impatriateActualPremium = roundCurrency(
    clampAmount(inputs.impatriatePremiumAmount ?? 0, 0, globalPremiumLimit),
  );
  const selectedPremium =
    impatriateRegime === "forfait30"
      ? impatriateForfaitPremium
      : impatriateRegime === "actualPremium"
        ? impatriateActualPremium
        : 0;

  return {
    impatriateRegime,
    impatriateSalaryExemption: roundCurrency(
      clampAmount(selectedPremium, 0, impatriatePremiumLimit),
    ),
    impatriatePremiumLimit,
    impatriateForfaitPremium,
    impatriateActualPremium,
    frenchReferenceSalary,
    impatriateReferenceSalaryLimit,
  };
}

export function calculateFR(inputs: FRCalculatorInputs): CalculationResult {
  const householdStatus = inputs.householdStatus ?? "single";
  const numberOfChildren = Math.max(0, Math.floor(inputs.numberOfChildren ?? 0));
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxableGrossIncome = roundCurrency(
    inputs.grossSalary + taxableBenefitsInKind,
  );
  const { baseParts, totalParts } = calculateHouseholdParts(
    householdStatus,
    numberOfChildren,
  );
  const employeeSocialContribution = roundCurrency(
    taxableGrossIncome * taxConfig.employeeSocialRate,
  );
  const {
    impatriateRegime,
    impatriateSalaryExemption,
    impatriatePremiumLimit,
    impatriateForfaitPremium,
    impatriateActualPremium,
    frenchReferenceSalary,
    impatriateReferenceSalaryLimit,
  } = calculateImpatriateSalaryExemption(inputs);
  const taxableEmploymentIncome = roundCurrency(
    Math.max(0, taxableGrossIncome - impatriateSalaryExemption),
  );
  const standardDeduction = roundCurrency(
    inputs.professionalExpenseMethod === "actual"
      ? clampAmount(
          inputs.contributions.actualProfessionalExpenses ?? 0,
          0,
          taxableEmploymentIncome,
        )
      : calculateFRStandardEmploymentDeduction(taxableEmploymentIncome),
  );
  const actualProfessionalExpenses =
    inputs.professionalExpenseMethod === "actual" ? standardDeduction : 0;
  const retirementSavingsLimit = roundCurrency(
    calculateFRRetirementSavingsLimit(inputs.grossSalary),
  );
  const retirementSavingsContribution = roundCurrency(
    clampAmount(
      inputs.contributions.retirementSavings ?? 0,
      0,
      retirementSavingsLimit,
    ),
  );
  const retirementSavingsDeduction = retirementSavingsContribution;
  const disallowedRetirementSavings = roundCurrency(
    Math.max(
      0,
      (inputs.contributions.retirementSavings ?? 0) -
        retirementSavingsDeduction,
    ),
  );
  const taxHouseholdParts = clampAmount(totalParts, 1, 12);
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      taxableEmploymentIncome -
        standardDeduction -
        retirementSavingsDeduction -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution
          : 0),
    ),
  );
  const taxWithParts = calculateTaxWithHouseholdParts(
    taxableIncome,
    taxHouseholdParts,
  );
  const taxWithBaseParts = calculateTaxWithHouseholdParts(
    taxableIncome,
    baseParts,
  );
  const familyQuotientBenefit = roundCurrency(
    Math.max(0, taxWithBaseParts.total - taxWithParts.total),
  );
  const familyQuotientCap = roundCurrency(
    calculateFamilyQuotientCap(
      householdStatus,
      baseParts,
      taxHouseholdParts,
      numberOfChildren,
    ),
  );
  const incomeTaxBeforeQuotientCap = taxWithParts.total;
  const incomeTaxAfterQuotientCap = roundCurrency(
    familyQuotientCap > 0
      ? Math.max(taxWithParts.total, taxWithBaseParts.total - familyQuotientCap)
      : taxWithParts.total,
  );
  const familyQuotientCapApplied =
    incomeTaxAfterQuotientCap > incomeTaxBeforeQuotientCap;
  const decote = calculateDecote(incomeTaxAfterQuotientCap, householdStatus);
  const incomeTaxBeforeCredits = roundCurrency(
    Math.max(0, incomeTaxAfterQuotientCap - decote),
  );
  const charitableDonations = roundCurrency(
    clampAmount(
      inputs.contributions.charitableDonations ?? 0,
      0,
      taxableIncome * FR_GENERAL_DONATION_REDUCTION_2026.taxableIncomeLimitRate,
    ),
  );
  const charitableDonationReduction = roundCurrency(
    Math.min(
      incomeTaxBeforeCredits,
      charitableDonations * FR_GENERAL_DONATION_REDUCTION_2026.rate,
    ),
  );
  const taxAfterReductions = roundCurrency(
    Math.max(0, incomeTaxBeforeCredits - charitableDonationReduction),
  );
  const lowTaxCollectionReduction =
    taxAfterReductions > 0 && taxAfterReductions < FR_LOW_TAX_COLLECTION_THRESHOLD
      ? taxAfterReductions
      : 0;
  const incomeTax = roundCurrency(
    Math.max(0, taxAfterReductions - lowTaxCollectionReduction),
  );
  const additionalIncomeTax = 0;

  const totalDeductions = roundCurrency(
    incomeTax +
      additionalIncomeTax +
      employeeSocialContribution +
      retirementSavingsContribution +
      charitableDonations,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalDeductions);

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
    taxableBenefitsInKind,
    taxableGrossIncome,
    taxableEmploymentIncome,
    taxableIncome,
    standardDeduction,
    professionalExpenseMethod: inputs.professionalExpenseMethod,
    actualProfessionalExpenses,
    impatriateRegime,
    impatriateSalaryExemption,
    impatriatePremiumLimit,
    impatriateForfaitPremium,
    impatriateActualPremium,
    frenchReferenceSalary,
    impatriateReferenceSalaryLimit,
    retirementSavingsDeduction,
    retirementSavingsLimit,
    disallowedRetirementSavings,
    charitableDonations,
    charitableDonationReduction,
    taxHouseholdParts,
    householdStatus,
    numberOfChildren,
    baseHouseholdParts: baseParts,
    familyQuotientBenefit,
    familyQuotientCap,
    familyQuotientCapApplied,
    incomeTaxBeforeQuotientCap,
    incomeTaxBeforeCredits,
    decote,
    lowTaxCollectionReduction,
    bracketTaxes: taxWithParts.bracketTaxes,
    taxCredit: roundCurrency(decote + charitableDonationReduction + lowTaxCollectionReduction),
    employeeSocialContribution: {
      name: taxConfig.employeeSocialName,
      amount: employeeSocialContribution,
      rate: taxConfig.employeeSocialRate,
    },
    additionalIncomeTax: {
      name: "Additional income tax",
      amount: additionalIncomeTax,
      rate: 0,
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
    totalTax: roundCurrency(incomeTax + additionalIncomeTax + employeeSocialContribution),
    totalDeductions,
    netSalary,
    effectiveTaxRate:
      inputs.grossSalary > 0
        ? (incomeTax + additionalIncomeTax + employeeSocialContribution) /
          inputs.grossSalary
        : 0,
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

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grossSalary =
      inputs?.country === "FR" && typeof inputs.grossSalary === "number"
        ? inputs.grossSalary
        : taxConfig.defaultSalary;

    return {
      retirementSavings: {
        limit: roundCurrency(calculateFRRetirementSavingsLimit(grossSalary)),
        name: "PER retirement savings",
        description:
          "Optional French PER-style retirement savings deductible from taxable income within the modeled annual ceiling",
        preTax: true,
      },
      charitableDonations: {
        limit: roundCurrency(grossSalary * 0.2),
        name: "General charitable donations",
        description:
          "General qualifying donations modeled at the 66% tax-reduction rate within the 20% taxable-income limit",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): FRCalculatorInputs {
    return {
      country: "FR",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      taxableBenefitsInKind: 0,
      householdStatus: "single",
      numberOfChildren: 0,
      taxHouseholdParts: 1,
      professionalExpenseMethod: "standard_10_percent",
      impatriateRegime: "none",
      impatriatePremiumAmount: 0,
      frenchReferenceSalary: 0,
      contributions: {
        retirementSavings: 0,
        actualProfessionalExpenses: 0,
        charitableDonations: 0,
      },
    };
  },
};
