import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { AT_CONFIG } from "./config";
import {
  AT_EMPLOYEE_TAX_CREDITS_2026,
  AT_SPECIAL_PAYMENT_LOW_INCOME_TAX_FREE_LIMIT_2026,
  AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026,
  AT_SPECIAL_PAYMENT_SOCIAL_RATE_2026,
  AT_SPECIAL_PAYMENT_TAX_BRACKETS_2026,
  calculateAustriaCommuterAllowance,
  calculateAustriaDonationLimit,
  calculateAustriaPendlereuro,
  calculateAustriaSingleEarnerOrParentCredit,
  AT_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  ATBreakdown,
  ATCalculatorInputs,
  ATSpecialPaymentMode,
  ATTaxBreakdown,
} from "./types";

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  standardDeduction: number | ((grossSalary: number) => number);
  commuterAllowanceLimit: number;
  churchContributionLimit: number;
  donationLimitRate: number;
  familyBonusPlusUnder18PerChild: number;
  familyBonusPlusOver18PerChild: number;
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
function applyCredit(
  potentialCredit: number,
  remainingTax: number,
): { applied: number; remaining: number } {
  const applied = roundCurrency(clampAmount(potentialCredit, 0, remainingTax));
  return { applied, remaining: roundCurrency(remainingTax - applied) };
}
function calculateTransportationSurcharge(income: number): number {
  const credits = AT_EMPLOYEE_TAX_CREDITS_2026;
  if (income <= credits.transportationSurchargeFullIncomeLimit) {
    return credits.transportationSurcharge;
  }
  if (income >= credits.transportationSurchargePhaseoutLimit) {
    return 0;
  }
  return roundCurrency(
    credits.transportationSurcharge *
      ((credits.transportationSurchargePhaseoutLimit - income) /
        (credits.transportationSurchargePhaseoutLimit -
          credits.transportationSurchargeFullIncomeLimit)),
  );
}
function calculateElevatedCommuterCredit(income: number): number {
  const credits = AT_EMPLOYEE_TAX_CREDITS_2026;
  if (income <= credits.elevatedCommuterFullIncomeLimit) {
    return credits.elevatedCommuterCredit;
  }
  if (income >= credits.elevatedCommuterPhaseoutLimit) {
    return credits.transportationCredit;
  }
  return roundCurrency(
    credits.transportationCredit +
      (credits.elevatedCommuterCredit - credits.transportationCredit) *
        ((credits.elevatedCommuterPhaseoutLimit - income) /
          (credits.elevatedCommuterPhaseoutLimit -
            credits.elevatedCommuterFullIncomeLimit)),
  );
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
function getMarginalTaxRate(income: number, brackets: TaxBracket[]) {
  const bracket = brackets.find(
    (candidate) => income > candidate.min && income <= candidate.max,
  );
  return bracket?.rate ?? brackets.at(-1)?.rate ?? 0;
}
function calculateSpecialPaymentTax(
  taxableSpecialPayments: number,
  regularTaxableIncome: number,
  brackets: TaxBracket[],
) {
  const specialTaxBase = Math.max(0, taxableSpecialPayments);

  if (specialTaxBase <= AT_SPECIAL_PAYMENT_LOW_INCOME_TAX_FREE_LIMIT_2026) {
    return 0;
  }

  let tax = 0;
  for (const bracket of AT_SPECIAL_PAYMENT_TAX_BRACKETS_2026) {
    if (specialTaxBase <= bracket.min) continue;
    const upper = Math.min(specialTaxBase, bracket.max);
    const amount = upper - bracket.min;
    if (amount > 0) {
      tax += amount * bracket.rate;
    }
  }

  const topBracket =
    AT_SPECIAL_PAYMENT_TAX_BRACKETS_2026[
      AT_SPECIAL_PAYMENT_TAX_BRACKETS_2026.length - 1
    ];
  if (specialTaxBase > topBracket.max) {
    tax +=
      (specialTaxBase - topBracket.max) *
      getMarginalTaxRate(regularTaxableIncome, brackets);
  }

  return roundCurrency(tax);
}
function resolveSpecialPaymentProfile({
  grossSalary,
  mode,
  customSpecialPayments,
}: {
  grossSalary: number;
  mode: ATSpecialPaymentMode;
  customSpecialPayments: number;
}) {
  const safeGross = Math.max(0, grossSalary);
  const customAmount = Math.max(0, customSpecialPayments);

  switch (mode) {
    case "includedInGross": {
      const specialPayments = roundCurrency((safeGross * 2) / 14);
      return {
        regularGrossIncome: roundCurrency(safeGross - specialPayments),
        specialPayments,
      };
    }
    case "additionalToGross":
      return {
        regularGrossIncome: safeGross,
        specialPayments: roundCurrency(safeGross / 6),
      };
    case "customIncludedInGross": {
      const specialPayments = roundCurrency(
        clampAmount(customAmount, 0, safeGross),
      );
      return {
        regularGrossIncome: roundCurrency(safeGross - specialPayments),
        specialPayments,
      };
    }
    case "customAdditionalToGross":
      return {
        regularGrossIncome: safeGross,
        specialPayments: customAmount,
      };
    case "none":
      return {
        regularGrossIncome: safeGross,
        specialPayments: 0,
      };
  }
}
const taxConfig = AT_TAX_CONFIG as LocalSalaryTaxConfig;
export function calculateAT(inputs: ATCalculatorInputs): CalculationResult {
  const specialPaymentMode = inputs.specialPaymentMode ?? "includedInGross";
  const {
    regularGrossIncome,
    specialPayments,
  } = resolveSpecialPaymentProfile({
    grossSalary: inputs.grossSalary,
    mode: specialPaymentMode,
    customSpecialPayments: inputs.customSpecialPayments ?? 0,
  });
  const taxableInKindBenefits = roundCurrency(
    Math.max(0, inputs.taxableInKindBenefits ?? 0),
  );
  const annualSixthLimit = roundCurrency(regularGrossIncome / 6);
  const favoredSpecialPayments = roundCurrency(
    Math.min(specialPayments, annualSixthLimit),
  );
  const regularTaxedSpecialPayments = roundCurrency(
    Math.max(0, specialPayments - favoredSpecialPayments),
  );
  const grossSalary = roundCurrency(regularGrossIncome + specialPayments);
  const taxableGrossIncome = roundCurrency(
    grossSalary + taxableInKindBenefits,
  );
  const specialSocialContribution = roundCurrency(
    Math.min(specialPayments, AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026) *
      AT_SPECIAL_PAYMENT_SOCIAL_RATE_2026,
  );
  const favoredSpecialSocialContribution =
    specialPayments > 0
      ? roundCurrency(
          specialSocialContribution *
            (favoredSpecialPayments / specialPayments),
        )
      : 0;
  const regularTaxedSpecialSocialContribution = roundCurrency(
    specialSocialContribution - favoredSpecialSocialContribution,
  );
  const commuterAllowance = calculateAustriaCommuterAllowance(
    inputs.commuterAllowanceType ?? "none",
    inputs.commuterDistanceBand ?? "none",
    inputs.commuterWorkdays ?? "full",
  );
  const commuterPendlereuroPotential =
    commuterAllowance > 0
      ? calculateAustriaPendlereuro(
          inputs.commuterOneWayKm ?? 0,
          inputs.commuterWorkdays ?? "full",
        )
      : 0;
  const familyBonusChildrenUnder18 = clampInteger(
    inputs.familyBonusChildrenUnder18 ?? inputs.familyBonusChildren,
    0,
    20,
  );
  const familyBonusChildrenOver18 = clampInteger(
    inputs.familyBonusChildrenOver18 ?? 0,
    0,
    20,
  );
  const familyBonusChildren =
    familyBonusChildrenUnder18 + familyBonusChildrenOver18;
  const familyBonusShare = inputs.familyBonusShare === "half" ? 0.5 : 1;
  const employeeSocialBase = Math.min(
    regularGrossIncome + taxableInKindBenefits,
    taxConfig.employeeSocialCap ?? regularGrossIncome + taxableInKindBenefits,
  );
  const employeeSocialContribution = roundCurrency(
    employeeSocialBase * taxConfig.employeeSocialRate,
  );
  const standardDeduction = roundCurrency(
    typeof taxConfig.standardDeduction === "function"
      ? taxConfig.standardDeduction(regularGrossIncome)
      : taxConfig.standardDeduction,
  );
  const incomeBeforeSpecialExpenses = roundCurrency(
    Math.max(
      0,
      regularGrossIncome +
        taxableInKindBenefits +
        regularTaxedSpecialPayments -
        standardDeduction -
        commuterAllowance -
        (taxConfig.deductEmployeeSocialBeforeIncomeTax
          ? employeeSocialContribution + regularTaxedSpecialSocialContribution
          : 0),
    ),
  );
  const churchContributions = roundCurrency(
    clampAmount(
      inputs.contributions.churchContributions ?? 0,
      0,
      taxConfig.churchContributionLimit,
    ),
  );
  const charitableDonationLimit = roundCurrency(
    calculateAustriaDonationLimit(incomeBeforeSpecialExpenses),
  );
  const charitableDonations = roundCurrency(
    clampAmount(
      inputs.contributions.charitableDonations ?? 0,
      0,
      charitableDonationLimit,
    ),
  );
  const voluntaryPensionInsurance = roundCurrency(
    clampAmount(
      inputs.contributions.voluntaryPensionInsurance ?? 0,
      0,
      grossSalary,
    ),
  );
  const specialExpenseDeduction = roundCurrency(
    churchContributions + charitableDonations + voluntaryPensionInsurance,
  );
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      incomeBeforeSpecialExpenses - specialExpenseDeduction,
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateBracketTax(
    taxableIncome,
    taxConfig.brackets,
  );
  const specialPaymentTaxableIncome = roundCurrency(
    Math.max(0, favoredSpecialPayments - favoredSpecialSocialContribution),
  );
  const specialPaymentIncomeTax = calculateSpecialPaymentTax(
    specialPaymentTaxableIncome,
    taxableIncome,
    taxConfig.brackets,
  );
  let remainingTaxForCredits = incomeTaxBeforeCredits;
  const transportationCreditResult = applyCredit(
    AT_EMPLOYEE_TAX_CREDITS_2026.transportationCredit,
    remainingTaxForCredits,
  );
  const transportationTaxCredit = transportationCreditResult.applied;
  remainingTaxForCredits = transportationCreditResult.remaining;

  const elevatedCommuterTaxCreditPotential =
    commuterAllowance > 0
      ? Math.max(
          0,
          calculateElevatedCommuterCredit(taxableIncome) -
            AT_EMPLOYEE_TAX_CREDITS_2026.transportationCredit,
        )
      : 0;
  const elevatedCommuterCreditResult = applyCredit(
    elevatedCommuterTaxCreditPotential,
    remainingTaxForCredits,
  );
  const elevatedCommuterTaxCredit = elevatedCommuterCreditResult.applied;
  remainingTaxForCredits = elevatedCommuterCreditResult.remaining;

  const transportationSurchargeResult = applyCredit(
    calculateTransportationSurcharge(taxableIncome),
    remainingTaxForCredits,
  );
  const transportationSurchargeCredit = transportationSurchargeResult.applied;
  remainingTaxForCredits = transportationSurchargeResult.remaining;

  const pendlereuroResult = applyCredit(
    commuterPendlereuroPotential,
    remainingTaxForCredits,
  );
  const commuterPendlereuroCredit = pendlereuroResult.applied;
  remainingTaxForCredits = pendlereuroResult.remaining;

  const singleEarnerOrParentCreditPotential =
    inputs.familyCreditStatus === "singleEarner" ||
    inputs.familyCreditStatus === "singleParent"
      ? calculateAustriaSingleEarnerOrParentCredit(familyBonusChildren)
      : 0;
  const singleEarnerOrParentResult = applyCredit(
    singleEarnerOrParentCreditPotential,
    remainingTaxForCredits,
  );
  const singleEarnerOrParentCredit = singleEarnerOrParentResult.applied;
  remainingTaxForCredits = singleEarnerOrParentResult.remaining;

  const familyBonusPlusPotential = roundCurrency(
    (familyBonusChildrenUnder18 * taxConfig.familyBonusPlusUnder18PerChild +
      familyBonusChildrenOver18 * taxConfig.familyBonusPlusOver18PerChild) *
      familyBonusShare,
  );
  const familyBonusPlusResult = applyCredit(
    familyBonusPlusPotential,
    remainingTaxForCredits,
  );
  const familyBonusPlusCredit = familyBonusPlusResult.applied;
  remainingTaxForCredits = familyBonusPlusResult.remaining;

  const taxCredit = roundCurrency(
    transportationTaxCredit +
      elevatedCommuterTaxCredit +
      transportationSurchargeCredit +
      commuterPendlereuroCredit +
      singleEarnerOrParentCredit +
      familyBonusPlusCredit,
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = roundCurrency(
    taxableIncome * (taxConfig.additionalFlatIncomeTaxRate ?? 0),
  );
  const totalTax = roundCurrency(
    incomeTax +
      specialPaymentIncomeTax +
      additionalIncomeTax +
      employeeSocialContribution +
      specialSocialContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const totalDeductions = roundCurrency(
    totalTax +
      churchContributions +
      charitableDonations +
      voluntaryPensionInsurance,
  );
  const netSalary = roundCurrency(grossSalary - totalDeductions);
  const taxes: ATTaxBreakdown = {
    type: "AT",
    totalIncomeTax: roundCurrency(
      incomeTax + specialPaymentIncomeTax + additionalIncomeTax,
    ),
    incomeTax,
    specialPaymentIncomeTax,
    employeeSocialContribution,
    employeeSpecialSocialContribution: specialSocialContribution,
    additionalIncomeTax,
  };
  const breakdown: ATBreakdown = {
    type: "AT",
    grossIncome: grossSalary,
    regularGrossIncome,
    specialPayments,
    taxableInKindBenefits,
    taxableGrossIncome,
    favoredSpecialPayments,
    regularTaxedSpecialPayments,
    specialPaymentTaxableIncome,
    specialPaymentIncomeTax,
    specialPaymentMode,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    incomeTaxBeforeCredits,
    transportationTaxCredit,
    transportationSurchargeCredit,
    elevatedCommuterTaxCredit,
    commuterPendlereuroCredit,
    singleEarnerOrParentCredit,
    commuterAllowance,
    commuterAllowanceType: inputs.commuterAllowanceType ?? "none",
    commuterDistanceBand: inputs.commuterDistanceBand ?? "none",
    commuterWorkdays: inputs.commuterWorkdays ?? "full",
    commuterOneWayKm: inputs.commuterOneWayKm ?? 0,
    specialExpenseDeduction,
    churchContributions,
    charitableDonations,
    charitableDonationLimit,
    voluntaryPensionInsurance,
    familyBonusChildren,
    familyBonusChildrenUnder18,
    familyBonusChildrenOver18,
    familyBonusShare: inputs.familyBonusShare ?? "full",
    familyCreditStatus: inputs.familyCreditStatus ?? "none",
    familyBonusPlusCredit,
    employeeSocialContribution: {
      name: taxConfig.employeeSocialName,
      amount: employeeSocialContribution,
      rate: taxConfig.employeeSocialRate,
      cap: taxConfig.employeeSocialCap,
    },
    employeeSpecialSocialContribution: {
      name: "Employee social insurance on special payments",
      amount: specialSocialContribution,
      rate: AT_SPECIAL_PAYMENT_SOCIAL_RATE_2026,
      cap: AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026,
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
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate:
      grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
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
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const atInputs = inputs as Partial<ATCalculatorInputs> | undefined;
    const grossSalaryInput = atInputs?.grossSalary ?? taxConfig.defaultSalary;
    const specialPaymentMode =
      atInputs?.specialPaymentMode ?? "includedInGross";
    const { regularGrossIncome, specialPayments } =
      resolveSpecialPaymentProfile({
        grossSalary: grossSalaryInput,
        mode: specialPaymentMode,
        customSpecialPayments: atInputs?.customSpecialPayments ?? 0,
      });
    const grossSalary = regularGrossIncome + specialPayments;
    const taxableInKindBenefits = Math.max(
      0,
      atInputs?.taxableInKindBenefits ?? 0,
    );
    const employeeSocialBase = Math.min(
      regularGrossIncome + taxableInKindBenefits,
      taxConfig.employeeSocialCap ?? regularGrossIncome + taxableInKindBenefits,
    );
    const employeeSocialContribution = roundCurrency(
      employeeSocialBase * taxConfig.employeeSocialRate,
    );
    const commuterAllowance =
      atInputs?.commuterAllowanceType && atInputs?.commuterDistanceBand
        ? calculateAustriaCommuterAllowance(
            atInputs.commuterAllowanceType,
            atInputs.commuterDistanceBand,
            atInputs.commuterWorkdays ?? "full",
          )
        : 0;
    const donationLimit = roundCurrency(
      calculateAustriaDonationLimit(
        grossSalary +
          taxableInKindBenefits -
          employeeSocialContribution -
          commuterAllowance,
      ),
    );
    return {
      churchContributions: {
        limit: taxConfig.churchContributionLimit,
        name: "Church contributions",
        description:
          "Deductible church contributions to recognized churches and religious societies",
        preTax: true,
      },
      charitableDonations: {
        limit: donationLimit,
        name: "Charitable donations",
        description:
          "Deductible donations to qualifying recipients, capped at 10% of modeled income",
        preTax: true,
      },
      voluntaryPensionInsurance: {
        limit: grossSalary,
        name: "Voluntary statutory pension insurance",
        description:
          "Voluntary continuation or buy-back contributions to statutory pension insurance",
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
      familyBonusChildrenUnder18: 0,
      familyBonusChildrenOver18: 0,
      familyBonusShare: "full",
      familyCreditStatus: "none",
      commuterAllowanceType: "none",
      commuterDistanceBand: "none",
      commuterWorkdays: "full",
      commuterOneWayKm: 0,
      specialPaymentMode: "includedInGross",
      customSpecialPayments: 0,
      taxableInKindBenefits: 0,
      contributions: {
        churchContributions: 0,
        charitableDonations: 0,
        voluntaryPensionInsurance: 0,
      },
    };
  },
};
