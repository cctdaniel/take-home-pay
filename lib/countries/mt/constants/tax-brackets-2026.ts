// ============================================================================
// MALTA EMPLOYMENT INCOME TAX AND CLASS 1 SSC (BASIS YEAR 2026)
// ============================================================================
//
// Official income tax sources:
// Malta Tax and Customs Administration, Tax Rates for Individuals 2026:
// https://mtca.gov.mt/personal-tax/tax-rates/tax-ratesindividuals
// Malta Tax and Customs Administration, New Tax Rates 2026 PDF:
// https://mtca.gov.mt/docs/default-source/documents/2026-tax-rates.pdf?sfvrsn=37563fb2_4
// Malta Tax and Customs Administration, Tax Rates for Non-Residents:
// https://mtca.gov.mt/personal-tax/tax-rates/taxratesfornonresident
//
// Official SSC sources:
// Social Security Malta, Class 1 Contributions 2026 - Employed Persons:
// https://socialsecurity.gov.mt/en/information-and-applications-for-benefits-and-services/social-security-contributions/social-security-contributions-class-1-2026/
// Social Security Malta, Social Security Contributions overview:
// https://socialsecurity.gov.mt/en/information-and-applications-for-benefits-and-services/social-security-contributions/social-security-contributions/
//
// Official deduction and tax credit sources:
// Deduction (Income from Employment) Rules, S.L. 123.149:
// https://legislation.mt/getpdf/6943d31cf42ba74214289ca8
// MTCA Tax Return Booklet 2025, sections on deductions and tax credits:
// https://mtca.gov.mt/docs/default-source/documents/personal-tax/individual/tax-return-booklet-individuals/mtca-tax-booklet-2025-eng.pdf?sfvrsn=ae2aeba5_1
// MTCA RA23 Voluntary Occupational Pension Scheme form:
// https://mtca.gov.mt/docs/default-source/documents/personal-tax/individual/return-attachments/mtca-ra23-mlt-eng.pdf?sfvrsn=e90d4e6d_1
//
// Official nomad guidance considered but excluded from ordinary employment:
// https://mtca.gov.mt/docs/default-source/documents/personal-tax/legal-and-technical/guidelines/nomad-guidelines---12-03-2026.pdf?sfvrsn=f0cc9971_6
//
// Assumptions:
// - Models ordinary adult employment salary in Malta.
// - Social Security Class 1 Category B/C/D is modeled for adult employees.
// - Category A under-18 employees, apprenticeship students, part-time jobs
//   under 8 hours, special final taxes, pension income exemptions, permanent
//   resident/returned migrant/special tax status programmes, and nomad
//   authorised work are outside this calculator.
// - Employee Class 1 SSC is treated as a payroll deduction, not an income-tax
//   deduction. Employer SSC and the Maternity Leave Fund are informational.
// ============================================================================

import type {
  MTLowIncomeSscOption,
  MTSSCBirthCohort,
  MTTaxStatus,
} from "../types";

export interface MaltaTaxScheduleBand {
  min: number;
  max: number;
  rate: number;
  subtract: number;
}

export interface MaltaTaxSchedule {
  name: string;
  bands: MaltaTaxScheduleBand[];
}

export const MALTA_TAX_STATUS_NAMES: Record<MTTaxStatus, string> = {
  single: "Single rates",
  married: "Married rates",
  married_one_child: "Married rates with 1 child",
  married_two_or_more_children: "Married rates with 2+ children",
  parent: "Parent rates",
  parent_one_child: "Parent rates with 1 child",
  parent_two_or_more_children: "Parent rates with 2+ children",
};

export const MALTA_RESIDENT_TAX_SCHEDULES_2026: Record<
  MTTaxStatus,
  MaltaTaxSchedule
> = {
  single: {
    name: MALTA_TAX_STATUS_NAMES.single,
    bands: [
      { min: 0, max: 12_000, rate: 0, subtract: 0 },
      { min: 12_001, max: 16_000, rate: 0.15, subtract: 1_800 },
      { min: 16_001, max: 60_000, rate: 0.25, subtract: 3_400 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 9_400 },
    ],
  },
  married: {
    name: MALTA_TAX_STATUS_NAMES.married,
    bands: [
      { min: 0, max: 15_000, rate: 0, subtract: 0 },
      { min: 15_001, max: 23_000, rate: 0.15, subtract: 2_250 },
      { min: 23_001, max: 60_000, rate: 0.25, subtract: 4_550 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 10_550 },
    ],
  },
  married_one_child: {
    name: MALTA_TAX_STATUS_NAMES.married_one_child,
    bands: [
      { min: 0, max: 17_500, rate: 0, subtract: 0 },
      { min: 17_501, max: 26_500, rate: 0.15, subtract: 2_625 },
      { min: 26_501, max: 60_000, rate: 0.25, subtract: 5_275 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 11_275 },
    ],
  },
  married_two_or_more_children: {
    name: MALTA_TAX_STATUS_NAMES.married_two_or_more_children,
    bands: [
      { min: 0, max: 22_500, rate: 0, subtract: 0 },
      { min: 22_501, max: 32_000, rate: 0.15, subtract: 3_375 },
      { min: 32_001, max: 60_000, rate: 0.25, subtract: 6_575 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 12_575 },
    ],
  },
  parent: {
    name: MALTA_TAX_STATUS_NAMES.parent,
    bands: [
      { min: 0, max: 13_000, rate: 0, subtract: 0 },
      { min: 13_001, max: 17_500, rate: 0.15, subtract: 1_950 },
      { min: 17_501, max: 60_000, rate: 0.25, subtract: 3_700 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 9_700 },
    ],
  },
  parent_one_child: {
    name: MALTA_TAX_STATUS_NAMES.parent_one_child,
    bands: [
      { min: 0, max: 14_500, rate: 0, subtract: 0 },
      { min: 14_501, max: 21_000, rate: 0.15, subtract: 2_175 },
      { min: 21_001, max: 60_000, rate: 0.25, subtract: 4_275 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 10_275 },
    ],
  },
  parent_two_or_more_children: {
    name: MALTA_TAX_STATUS_NAMES.parent_two_or_more_children,
    bands: [
      { min: 0, max: 18_500, rate: 0, subtract: 0 },
      { min: 18_501, max: 25_500, rate: 0.15, subtract: 2_775 },
      { min: 25_501, max: 60_000, rate: 0.25, subtract: 5_325 },
      { min: 60_001, max: Infinity, rate: 0.35, subtract: 11_325 },
    ],
  },
};

export const MALTA_NON_RESIDENT_TAX_SCHEDULE_2026: MaltaTaxSchedule = {
  name: "Non-resident rates",
  bands: [
    { min: 0, max: 700, rate: 0, subtract: 0 },
    { min: 701, max: 3_100, rate: 0.2, subtract: 140 },
    { min: 3_101, max: 7_800, rate: 0.3, subtract: 450 },
    { min: 7_801, max: Infinity, rate: 0.35, subtract: 840 },
  ],
};

export const MALTA_EMPLOYMENT_INCOME_DEDUCTION_2026 = {
  threshold: 12_445,
  floor: 12_000,
};

export const MALTA_CLASS_1_SSC_2026 = {
  weeksPerYear: 52,
  lowWeeklyWageThreshold: 229.44,
  lowIncomeStandardWeeklyEmployee: 22.94,
  lowIncomeStandardWeeklyEmployer: 22.94,
  lowIncomeMaternityLeaveFundWeekly: 0.69,
  lowIncomeProRataRate: 0.1,
  maternityLeaveFundRate: 0.003,
  bornBefore1962: {
    categoryCMaxWeeklyWage: 490.38,
    categoryDWeeklyEmployee: 49.04,
    categoryDWeeklyEmployer: 49.04,
    categoryDWeeklyMaternityLeaveFund: 1.47,
  },
  born1962OrLater: {
    categoryCMaxWeeklyWage: 559.3,
    categoryDWeeklyEmployee: 55.93,
    categoryDWeeklyEmployer: 55.93,
    categoryDWeeklyMaternityLeaveFund: 1.68,
  },
};

export const MALTA_RETIREMENT_TAX_CREDITS_2026 = {
  personalRetirementScheme: {
    maxCreditableContribution: 3_000,
    creditRate: 0.25,
    maxCredit: 750,
  },
  voluntaryOccupationalPension: {
    maxCreditableContribution: 3_000,
    creditRate: 0.25,
    maxCredit: 750,
  },
};

export const MALTA_QUALIFYING_FEE_DEDUCTIONS_2026 = {
  schoolFees: {
    kindergarten: 1_600,
    primary: 1_900,
    secondary: 2_600,
  },
  childcareFees: 2_000,
  sportsFees: 300,
  culturalFees: 300,
};

export function getMaltaTaxSchedule(
  isResident: boolean,
  taxStatus: MTTaxStatus,
): MaltaTaxSchedule {
  return isResident
    ? MALTA_RESIDENT_TAX_SCHEDULES_2026[taxStatus]
    : MALTA_NON_RESIDENT_TAX_SCHEDULE_2026;
}

export function getMaltaSchoolFeeLimit(
  schoolLevel: "none" | "kindergarten" | "primary" | "secondary",
): number {
  if (schoolLevel === "none") {
    return 0;
  }

  return MALTA_QUALIFYING_FEE_DEDUCTIONS_2026.schoolFees[schoolLevel];
}

function getApplicableBand(
  income: number,
  schedule: MaltaTaxSchedule,
): MaltaTaxScheduleBand {
  const chargeableIncome = Math.max(0, income);

  return (
    schedule.bands.find((band) => chargeableIncome <= band.max) ??
    schedule.bands[schedule.bands.length - 1]
  );
}

export function calculateMaltaIncomeTax(
  income: number,
  schedule: MaltaTaxSchedule,
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const chargeableIncome = Math.max(0, income);
  const applicableBand = getApplicableBand(chargeableIncome, schedule);
  const totalTax = Math.max(
    0,
    chargeableIncome * applicableBand.rate - applicableBand.subtract,
  );

  const bracketTaxes = schedule.bands
    .map((band, index) => {
      const previousMax = index === 0 ? 0 : schedule.bands[index - 1].max;
      const segmentMin = index === 0 ? 0 : previousMax;
      const taxableAmount = Math.max(
        0,
        Math.min(chargeableIncome, band.max) - segmentMin,
      );

      return {
        min: segmentMin,
        max: band.max,
        rate: band.rate,
        tax: taxableAmount * band.rate,
      };
    })
    .filter((band) => band.tax > 0 || band.rate === 0);

  return {
    totalTax,
    bracketTaxes,
  };
}

export function calculateMaltaEmploymentIncomeDeduction(
  grossEmploymentIncome: number,
  taxStatus: MTTaxStatus,
  isResident: boolean,
): number {
  if (!isResident || taxStatus !== "single") {
    return 0;
  }

  if (
    grossEmploymentIncome <= MALTA_EMPLOYMENT_INCOME_DEDUCTION_2026.floor ||
    grossEmploymentIncome > MALTA_EMPLOYMENT_INCOME_DEDUCTION_2026.threshold
  ) {
    return 0;
  }

  return (
    grossEmploymentIncome - MALTA_EMPLOYMENT_INCOME_DEDUCTION_2026.floor
  );
}

export function calculateMaltaRetirementTaxCredit(
  contribution: number,
  scheme: keyof typeof MALTA_RETIREMENT_TAX_CREDITS_2026,
): {
  eligibleContribution: number;
  taxCredit: number;
  maxCreditableContribution: number;
  maxCredit: number;
} {
  const limit = MALTA_RETIREMENT_TAX_CREDITS_2026[scheme];
  const eligibleContribution = Math.min(
    Math.max(0, contribution),
    limit.maxCreditableContribution,
  );
  const taxCredit = Math.min(
    eligibleContribution * limit.creditRate,
    limit.maxCredit,
  );

  return {
    eligibleContribution,
    taxCredit,
    maxCreditableContribution: limit.maxCreditableContribution,
    maxCredit: limit.maxCredit,
  };
}

export function calculateMaltaClass1Ssc(
  grossEmploymentIncome: number,
  birthCohort: MTSSCBirthCohort,
  lowIncomeOption: MTLowIncomeSscOption,
): {
  category: "B" | "C" | "D";
  basicWeeklyWage: number;
  employeeWeekly: number;
  employerWeekly: number;
  maternityLeaveFundWeekly: number;
  employeeAnnual: number;
  employerAnnual: number;
  maternityLeaveFundAnnual: number;
  employeeRate: number;
  employerRate: number;
  annualContributionWage: number;
} {
  const weeksPerYear = MALTA_CLASS_1_SSC_2026.weeksPerYear;
  const basicWeeklyWage = Math.max(0, grossEmploymentIncome / weeksPerYear);

  if (basicWeeklyWage <= MALTA_CLASS_1_SSC_2026.lowWeeklyWageThreshold) {
    const employeeWeekly =
      lowIncomeOption === "pro_rata"
        ? basicWeeklyWage * MALTA_CLASS_1_SSC_2026.lowIncomeProRataRate
        : MALTA_CLASS_1_SSC_2026.lowIncomeStandardWeeklyEmployee;
    const employerWeekly =
      MALTA_CLASS_1_SSC_2026.lowIncomeStandardWeeklyEmployer;

    return {
      category: "B",
      basicWeeklyWage,
      employeeWeekly,
      employerWeekly,
      maternityLeaveFundWeekly:
        MALTA_CLASS_1_SSC_2026.lowIncomeMaternityLeaveFundWeekly,
      employeeAnnual: employeeWeekly * weeksPerYear,
      employerAnnual: employerWeekly * weeksPerYear,
      maternityLeaveFundAnnual:
        MALTA_CLASS_1_SSC_2026.lowIncomeMaternityLeaveFundWeekly *
        weeksPerYear,
      employeeRate:
        grossEmploymentIncome > 0
          ? (employeeWeekly * weeksPerYear) / grossEmploymentIncome
          : 0,
      employerRate:
        grossEmploymentIncome > 0
          ? (employerWeekly * weeksPerYear) / grossEmploymentIncome
          : 0,
      annualContributionWage: grossEmploymentIncome,
    };
  }

  const cohortRates =
    birthCohort === "born_before_1962"
      ? MALTA_CLASS_1_SSC_2026.bornBefore1962
      : MALTA_CLASS_1_SSC_2026.born1962OrLater;

  if (basicWeeklyWage <= cohortRates.categoryCMaxWeeklyWage) {
    const employeeWeekly = basicWeeklyWage * 0.1;
    const employerWeekly = basicWeeklyWage * 0.1;
    const maternityLeaveFundWeekly =
      basicWeeklyWage * MALTA_CLASS_1_SSC_2026.maternityLeaveFundRate;

    return {
      category: "C",
      basicWeeklyWage,
      employeeWeekly,
      employerWeekly,
      maternityLeaveFundWeekly,
      employeeAnnual: employeeWeekly * weeksPerYear,
      employerAnnual: employerWeekly * weeksPerYear,
      maternityLeaveFundAnnual: maternityLeaveFundWeekly * weeksPerYear,
      employeeRate: 0.1,
      employerRate: 0.1,
      annualContributionWage: grossEmploymentIncome,
    };
  }

  return {
    category: "D",
    basicWeeklyWage,
    employeeWeekly: cohortRates.categoryDWeeklyEmployee,
    employerWeekly: cohortRates.categoryDWeeklyEmployer,
    maternityLeaveFundWeekly: cohortRates.categoryDWeeklyMaternityLeaveFund,
    employeeAnnual: cohortRates.categoryDWeeklyEmployee * weeksPerYear,
    employerAnnual: cohortRates.categoryDWeeklyEmployer * weeksPerYear,
    maternityLeaveFundAnnual:
      cohortRates.categoryDWeeklyMaternityLeaveFund * weeksPerYear,
    employeeRate:
      grossEmploymentIncome > 0
        ? (cohortRates.categoryDWeeklyEmployee * weeksPerYear) /
          grossEmploymentIncome
        : 0,
    employerRate:
      grossEmploymentIncome > 0
        ? (cohortRates.categoryDWeeklyEmployer * weeksPerYear) /
          grossEmploymentIncome
        : 0,
    annualContributionWage: grossEmploymentIncome,
  };
}
