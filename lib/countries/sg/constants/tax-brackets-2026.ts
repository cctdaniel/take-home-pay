// ============================================================================
// 2026 SINGAPORE INCOME TAX BRACKETS
// Source: Inland Revenue Authority of Singapore (IRAS)
// Note: Singapore uses a progressive tax system
// Non-resident employment income is taxed at 15% or resident rates, whichever is higher.
// ============================================================================

import type {
  TaxBracket,
  SGResidencyType,
  SGTaxResidencyType,
  SGTaxReliefInputs,
} from "../../types";

// ============================================================================
// SINGAPORE RESIDENT TAX BRACKETS (2026)
// Tax is calculated on chargeable income (after reliefs and deductions)
// ============================================================================
export const SG_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0 },            // First $20,000: 0%
  { min: 20000, max: 30000, rate: 0.02 },     // Next $10,000: 2%
  { min: 30000, max: 40000, rate: 0.035 },    // Next $10,000: 3.5%
  { min: 40000, max: 80000, rate: 0.07 },     // Next $40,000: 7%
  { min: 80000, max: 120000, rate: 0.115 },   // Next $40,000: 11.5%
  { min: 120000, max: 160000, rate: 0.15 },   // Next $40,000: 15%
  { min: 160000, max: 200000, rate: 0.18 },   // Next $40,000: 18%
  { min: 200000, max: 240000, rate: 0.19 },   // Next $40,000: 19%
  { min: 240000, max: 280000, rate: 0.195 },  // Next $40,000: 19.5%
  { min: 280000, max: 320000, rate: 0.20 },   // Next $40,000: 20%
  { min: 320000, max: 500000, rate: 0.22 },   // Next $180,000: 22%
  { min: 500000, max: 1000000, rate: 0.23 },  // Next $500,000: 23%
  { min: 1000000, max: Infinity, rate: 0.24 }, // Above $1,000,000: 24%
];

export const SG_NON_RESIDENT_EMPLOYMENT_RATE = 0.15;

// ============================================================================
// TAX RELIEFS AND DEDUCTIONS (2026)
// ============================================================================
export const SG_TAX_RELIEFS = {
  // Earned Income Relief
  earnedIncomeReliefBelow55: 1000,
  earnedIncomeRelief55to59: 6000,
  earnedIncomeRelief60andAbove: 8000,

  // CPF Relief (capped at actual CPF contributions)
  cpfReliefCap: 37740, // Maximum CPF OA relief (based on OW ceiling * 37%)

  // Spouse Relief (if spouse income < $4,000)
  spouseRelief: 2000,
  disabledSpouseRelief: 5500,

  // Qualifying Child Relief (per child)
  childRelief: 4000,
  disabledChildRelief: 7500,

  // Working Mother's Child Relief (WMCR) - % of mother's earned income
  // 1st child: 15%, 2nd child: 20%, 3rd+ child: 25%
  wmcrRates: [0.15, 0.20, 0.25] as readonly number[],
  wmcrFixedFirstChild: 8000,
  wmcrFixedSecondChild: 10000,
  wmcrFixedThirdAndLaterChild: 12000,
  wmcrCap: 50000, // Cap per child

  // Parent Relief
  parentReliefStaying: 9000, // Living with taxpayer
  parentReliefNotStaying: 5500, // Not living with taxpayer
  disabledParentReliefStaying: 14000,
  disabledParentReliefNotStaying: 10000,
  grandparentCaregiverRelief: 3000,

  // Personal Relief (for specific qualifications)
  handicappedBrother: 5500,
  handicappedSister: 5500,
  disabledSiblingRelief: 5500,

  // Life Insurance Relief (cap)
  lifeInsuranceReliefCap: 5000,
  lifeInsuranceCapitalSumRate: 0.07,

  // Course Fees Relief
  courseFeesReliefCap: 5500,

  // SRS Relief (full amount contributed is tax deductible)
  srsReliefCitizen: 15300,
  srsReliefForeigner: 35700,

  // Voluntary CPF Top-up Relief
  voluntaryCpfTopUpReliefCap: 8000,
  personalReliefCap: 80000,
  approvedDonationDeductionRate: 2.5,
  donationDeductionStatutoryIncomeCapRate: 0.4,
  parenthoodTaxRebateFirstChild: 5000,
  parenthoodTaxRebateSecondChild: 10000,
  parenthoodTaxRebateThirdAndLaterChild: 20000,
  nsmanSelfBasic: 1500,
  nsmanSelfActive: 3000,
  nsmanSelfKeyOrCommand: 5000,
  nsmanWifeRelief: 750,
  nsmanParentRelief: 750,
} as const;

export const SG_SOURCE_URLS = {
  rates:
    "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates",
  familyReliefs:
    "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-savings-for-married-couples-and-families",
  grandparentCaregiver:
    "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/grandparent-caregiver-relief",
  parenthoodTaxRebate:
    "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/parenthood-tax-rebate-%28ptr%29",
  personalRebate:
    "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/personal-income-tax-rebate",
  donations:
    "https://www.mof.gov.sg/policies/taxes/personal-income-tax/",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Singapore income tax using progressive brackets
 */
export function calculateProgressiveTax(chargeableIncome: number): number {
  let tax = 0;

  for (const bracket of SG_TAX_BRACKETS) {
    if (chargeableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(chargeableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate earned income relief based on age
 */
export function getEarnedIncomeRelief(age: number): number {
  if (age >= 60) return SG_TAX_RELIEFS.earnedIncomeRelief60andAbove;
  if (age >= 55) return SG_TAX_RELIEFS.earnedIncomeRelief55to59;
  return SG_TAX_RELIEFS.earnedIncomeReliefBelow55;
}

/**
 * Calculate Singapore income tax
 * For non-resident employment income, use 15% or progressive resident rates,
 * whichever gives a higher tax amount. Personal reliefs are resident-only;
 * approved donation deductions are allowed for both resident and non-resident
 * salary cases in this model.
 */
export interface SGTaxResult {
  chargeableIncome: number;
  incomeTax: number;
  effectiveTaxRate: number;
  grossTaxBeforeReliefs: number; // Tax on gross income without reliefs
  reliefs: {
    earnedIncomeRelief: number;
    cpfRelief: number;
    srsRelief: number;
    voluntaryCpfTopUpRelief: number;
    // Additional reliefs
    spouseRelief: number;
    disabledSpouseRelief: number;
    childRelief: number;
    disabledChildRelief: number;
    workingMotherRelief: number;
    parentRelief: number;
    grandparentCaregiverRelief: number;
    disabledSiblingRelief: number;
    lifeInsuranceRelief: number;
    nsmanRelief: number;
    reliefCapReduction: number;
    cappedPersonalReliefs: number;
    donationDeduction: number;
    courseFeesRelief: number;
    totalReliefs: number;
  };
  rebates: {
    parenthoodTaxRebate: number;
    totalRebates: number;
  };
}

export function calculateSGIncomeTax(
  annualIncome: number,
  cpfEmployeeContribution: number,
  srsContribution: number,
  voluntaryCpfTopUp: number,
  age: number,
  residencyType: SGResidencyType,
  taxResidency: SGTaxResidencyType,
  additionalReliefs?: SGTaxReliefInputs
): SGTaxResult {
  // Calculate automatic reliefs
  const isResident = taxResidency === "resident";
  const earnedIncomeRelief = isResident ? getEarnedIncomeRelief(age) : 0;
  const cpfRelief = isResident
    ? Math.min(cpfEmployeeContribution, SG_TAX_RELIEFS.cpfReliefCap)
    : 0;
  const srsRelief = isResident
    ? residencyType === "foreigner"
      ? Math.min(srsContribution, SG_TAX_RELIEFS.srsReliefForeigner)
      : Math.min(srsContribution, SG_TAX_RELIEFS.srsReliefCitizen)
    : 0;
  const cpfTopUpRelief =
    isResident && residencyType === "citizen_pr"
      ? Math.min(
          voluntaryCpfTopUp,
          SG_TAX_RELIEFS.voluntaryCpfTopUpReliefCap,
        )
      : 0;

  // Calculate additional reliefs (if provided)
  let spouseRelief = 0;
  let disabledSpouseRelief = 0;
  let childRelief = 0;
  let disabledChildRelief = 0;
  let workingMotherRelief = 0;
  let parentRelief = 0;
  let grandparentCaregiverRelief = 0;
  let disabledSiblingRelief = 0;
  let lifeInsuranceRelief = 0;
  let nsmanRelief = 0;
  let courseFeesRelief = 0;
  let donationDeduction = 0;
  let requestedParenthoodTaxRebate = 0;

  if (additionalReliefs) {
    donationDeduction = Math.min(
      Math.max(0, additionalReliefs.approvedDonations) *
        SG_TAX_RELIEFS.approvedDonationDeductionRate,
      annualIncome * SG_TAX_RELIEFS.donationDeductionStatutoryIncomeCapRate,
    );
  }

  if (isResident && additionalReliefs) {
    // Spouse Relief
    if (additionalReliefs.hasSpouseRelief) {
      spouseRelief = SG_TAX_RELIEFS.spouseRelief;
    }
    if (additionalReliefs.hasDisabledSpouseRelief) {
      disabledSpouseRelief = SG_TAX_RELIEFS.disabledSpouseRelief;
    }

    // Qualifying Child Relief
    if (additionalReliefs.numberOfChildren > 0) {
      childRelief = additionalReliefs.numberOfChildren * SG_TAX_RELIEFS.childRelief;
    }
    if (additionalReliefs.numberOfDisabledChildren > 0) {
      disabledChildRelief =
        additionalReliefs.numberOfDisabledChildren *
        SG_TAX_RELIEFS.disabledChildRelief;
    }

    // Working Mother's Child Relief (WMCR)
    if (additionalReliefs.isWorkingMother) {
      const pre2024Children = Math.max(
        0,
        Math.min(
          additionalReliefs.wmcrPre2024Children,
          additionalReliefs.numberOfChildren,
        ),
      );
      for (let i = 0; i < pre2024Children; i++) {
        const rateIndex = Math.min(i, SG_TAX_RELIEFS.wmcrRates.length - 1);
        const rate = SG_TAX_RELIEFS.wmcrRates[rateIndex];
        const wmcrForChild = Math.min(annualIncome * rate, SG_TAX_RELIEFS.wmcrCap);
        workingMotherRelief += wmcrForChild;
      }
      if (additionalReliefs.wmcrPost2024FirstChild) {
        workingMotherRelief += SG_TAX_RELIEFS.wmcrFixedFirstChild;
      }
      if (additionalReliefs.wmcrPost2024SecondChild) {
        workingMotherRelief += SG_TAX_RELIEFS.wmcrFixedSecondChild;
      }
      workingMotherRelief +=
        Math.max(0, additionalReliefs.wmcrPost2024ThirdAndLaterChildren) *
        SG_TAX_RELIEFS.wmcrFixedThirdAndLaterChild;
    }

    // Parent Relief
    if (additionalReliefs.parentRelief !== "none" && additionalReliefs.numberOfParents > 0) {
      const reliefPerParent = additionalReliefs.parentReliefForDisability
        ? additionalReliefs.parentRelief === "staying"
          ? SG_TAX_RELIEFS.disabledParentReliefStaying
          : SG_TAX_RELIEFS.disabledParentReliefNotStaying
        : additionalReliefs.parentRelief === "staying"
          ? SG_TAX_RELIEFS.parentReliefStaying
          : SG_TAX_RELIEFS.parentReliefNotStaying;
      parentRelief = reliefPerParent * additionalReliefs.numberOfParents;
    }

    if (additionalReliefs.grandparentCaregiverRelief) {
      grandparentCaregiverRelief = SG_TAX_RELIEFS.grandparentCaregiverRelief;
    }

    disabledSiblingRelief =
      Math.max(0, additionalReliefs.numberOfDisabledSiblings) *
      SG_TAX_RELIEFS.disabledSiblingRelief;

    const lifeInsuranceCpfRoom = Math.max(
      0,
      SG_TAX_RELIEFS.lifeInsuranceReliefCap - cpfEmployeeContribution,
    );
    lifeInsuranceRelief = Math.min(
      Math.max(0, additionalReliefs.lifeInsurancePremiums),
      Math.max(0, additionalReliefs.lifeInsuranceCapitalSum) *
        SG_TAX_RELIEFS.lifeInsuranceCapitalSumRate,
      lifeInsuranceCpfRoom,
    );

    const nsmanSelfRelief =
      additionalReliefs.nsmanSelfRelief === "key_or_command"
        ? SG_TAX_RELIEFS.nsmanSelfKeyOrCommand
        : additionalReliefs.nsmanSelfRelief === "active"
          ? SG_TAX_RELIEFS.nsmanSelfActive
          : additionalReliefs.nsmanSelfRelief === "basic"
            ? SG_TAX_RELIEFS.nsmanSelfBasic
            : 0;
    nsmanRelief =
      nsmanSelfRelief +
      (additionalReliefs.hasNsmanWifeRelief
        ? SG_TAX_RELIEFS.nsmanWifeRelief
        : 0) +
      Math.max(0, additionalReliefs.numberOfNsmanParentReliefs) *
        SG_TAX_RELIEFS.nsmanParentRelief;

    const parenthoodRebateMax =
      (additionalReliefs.numberOfChildren >= 1
        ? SG_TAX_RELIEFS.parenthoodTaxRebateFirstChild
        : 0) +
      (additionalReliefs.numberOfChildren >= 2
        ? SG_TAX_RELIEFS.parenthoodTaxRebateSecondChild
        : 0) +
      Math.max(0, additionalReliefs.numberOfChildren - 2) *
        SG_TAX_RELIEFS.parenthoodTaxRebateThirdAndLaterChild;
    requestedParenthoodTaxRebate = Math.min(
      Math.max(0, additionalReliefs.parenthoodTaxRebate),
      parenthoodRebateMax,
    );

    // Course Fees Relief lapsed from YA 2026, so this compatibility field no
    // longer reduces tax.
    courseFeesRelief = 0;
  }

  const personalReliefsBeforeCap = isResident
    ? earnedIncomeRelief + cpfRelief + srsRelief + cpfTopUpRelief +
      spouseRelief + disabledSpouseRelief + childRelief +
      disabledChildRelief + workingMotherRelief + parentRelief +
      grandparentCaregiverRelief + disabledSiblingRelief +
      lifeInsuranceRelief + nsmanRelief + courseFeesRelief
    : 0;
  const cappedPersonalReliefs = Math.min(
    personalReliefsBeforeCap,
    SG_TAX_RELIEFS.personalReliefCap,
  );
  const reliefCapReduction = Math.max(
    0,
    personalReliefsBeforeCap - cappedPersonalReliefs,
  );
  const totalReliefs = cappedPersonalReliefs + donationDeduction;

  // Calculate chargeable income
  const chargeableIncome = Math.max(0, annualIncome - totalReliefs);

  // Calculate gross tax (on full income, no reliefs) for comparison with IRAS table
  const grossTaxBeforeReliefs = calculateProgressiveTax(annualIncome);

  // Calculate tax
  let incomeTax: number;

  if (taxResidency === "non_resident") {
    const progressiveTax = calculateProgressiveTax(chargeableIncome);
    const flatTax = Math.round(
      chargeableIncome * SG_NON_RESIDENT_EMPLOYMENT_RATE * 100,
    ) / 100;
    // Use the higher of the two (this is IRAS rule for non-residents)
    incomeTax = Math.max(progressiveTax, flatTax);
  } else {
    // For tax residents, use progressive tax after reliefs and deductions.
    incomeTax = calculateProgressiveTax(chargeableIncome);
  }
  const parenthoodTaxRebate = isResident
    ? Math.min(requestedParenthoodTaxRebate, incomeTax)
    : 0;
  incomeTax = Math.max(0, incomeTax - parenthoodTaxRebate);

  const effectiveTaxRate = annualIncome > 0 ? incomeTax / annualIncome : 0;

  return {
    chargeableIncome,
    incomeTax,
    effectiveTaxRate,
    grossTaxBeforeReliefs,
    reliefs: {
      earnedIncomeRelief,
      cpfRelief,
      srsRelief,
      voluntaryCpfTopUpRelief: cpfTopUpRelief,
      spouseRelief,
      disabledSpouseRelief,
      childRelief,
      disabledChildRelief,
      workingMotherRelief,
      parentRelief,
      grandparentCaregiverRelief,
      disabledSiblingRelief,
      lifeInsuranceRelief,
      nsmanRelief,
      reliefCapReduction,
      cappedPersonalReliefs,
      donationDeduction,
      courseFeesRelief,
      totalReliefs,
    },
    rebates: {
      parenthoodTaxRebate,
      totalRebates: parenthoodTaxRebate,
    },
  };
}
