import type { MYTaxReliefInputs, TaxBracket } from "../../types";

// ============================================================================
// MALAYSIA INDIVIDUAL TAX AND EMPLOYEE CONTRIBUTION CONSTANTS
// Tax data: Year of Assessment 2025, used as the latest published resident
// individual table available on HASiL/LHDN at implementation time.
// Sources:
// - Resident individual rates: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-rate/
// - Non-resident rates: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/non-resident/
// - Reliefs YA 2025: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-reliefs/
// - EPF/KWSP rates effective Oct 2025 wages: https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution
// - Non-Malaysian EPF expansion: https://www.kwsp.gov.my/en/employer/responsibilities/non-malaysian-citizen-employees
// - EPF/KWSP voluntary contribution limit: https://www.kwsp.gov.my/en/member/contribution/i-saraan
// - PERKESO employee rates and RM6,000 ceiling: https://www.perkeso.gov.my/en/our-services/protection/pekerja-bermajikan.html
// ============================================================================

export const MY_TAX_BRACKETS_YA_2025: TaxBracket[] = [
  { min: 0, max: 5_000, rate: 0 },
  { min: 5_000, max: 20_000, rate: 0.01 },
  { min: 20_000, max: 35_000, rate: 0.03 },
  { min: 35_000, max: 50_000, rate: 0.08 },
  { min: 50_000, max: 70_000, rate: 0.13 },
  { min: 70_000, max: 100_000, rate: 0.21 },
  { min: 100_000, max: 250_000, rate: 0.24 },
  { min: 250_000, max: 400_000, rate: 0.245 },
  { min: 400_000, max: 600_000, rate: 0.25 },
  { min: 600_000, max: 1_000_000, rate: 0.26 },
  { min: 1_000_000, max: 2_000_000, rate: 0.28 },
  { min: 2_000_000, max: Infinity, rate: 0.3 },
];

export const MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE = 0.3;

export const MY_RELIEFS_YA_2025 = {
  individual: 9_000,
  spouse: 4_000,
  childUnder18: 2_000,
  childTertiary: 8_000,
  disabledIndividual: 7_000,
  epfRetirement: 4_000,
  prs: 3_000,
  socso: 350,
  lifestyle: 2_500,
  medical: 10_000,
} as const;

export const MY_EPF_2025 = {
  age60: 60,
  monthlyWageThreshold: 5_000,
  percentCalculationThreshold: 20_000,
  citizen: {
    below60: {
      employee: 0.11,
      employerBelowOrEqual5000: 0.13,
      employerAbove5000: 0.12,
    },
    age60AndAbove: {
      employee: 0,
      employer: 0.04,
    },
  },
  prOrLegacy: {
    below60: {
      employee: 0.11,
      employerBelowOrEqual5000: 0.13,
      employerAbove5000: 0.12,
    },
    age60AndAbove: {
      employee: 0.055,
      employerBelowOrEqual5000: 0.065,
      employerAbove5000: 0.06,
    },
  },
  foreignerPost1998: {
    employee: 0.02,
    employer: 0.02,
  },
} as const;

export const MY_PERKESO_2025 = {
  monthlyWageCeiling: 6_000,
  socsoEmployeeRate: 0.005,
  eisEmployeeRate: 0.002,
  eisMinAge: 18,
  eisMaxAge: 60,
} as const;

export const MY_PRS_RELIEF_LIMIT = MY_RELIEFS_YA_2025.prs;
export const MY_VOLUNTARY_EPF_ANNUAL_LIMIT = 100_000;

export function calculateMYProgressiveTax(taxableIncome: number): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const bracket of MY_TAX_BRACKETS_YA_2025) {
    if (taxableIncome <= bracket.min) {
      continue;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    if (taxableInBracket <= 0) {
      continue;
    }

    const tax = taxableInBracket * bracket.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

export function calculateMYResidentReliefs({
  taxReliefs,
  epfEmployee,
  voluntaryEpf,
  prsContribution,
  socsoEmployee,
}: {
  taxReliefs: MYTaxReliefInputs;
  epfEmployee: number;
  voluntaryEpf: number;
  prsContribution: number;
  socsoEmployee: number;
}) {
  const spouseRelief = taxReliefs.hasSpouseRelief ? MY_RELIEFS_YA_2025.spouse : 0;
  const childUnder18Relief =
    Math.max(0, taxReliefs.numberOfChildrenUnder18) *
    MY_RELIEFS_YA_2025.childUnder18;
  const childTertiaryRelief =
    Math.max(0, taxReliefs.numberOfChildrenTertiary) *
    MY_RELIEFS_YA_2025.childTertiary;
  const disabledIndividualRelief = taxReliefs.isDisabled
    ? MY_RELIEFS_YA_2025.disabledIndividual
    : 0;
  const epfRelief = Math.min(
    epfEmployee + voluntaryEpf,
    MY_RELIEFS_YA_2025.epfRetirement,
  );
  const prsRelief = Math.min(prsContribution, MY_RELIEFS_YA_2025.prs);
  const socsoRelief = Math.min(socsoEmployee, MY_RELIEFS_YA_2025.socso);
  const lifestyleRelief = Math.min(
    taxReliefs.lifestyleRelief,
    MY_RELIEFS_YA_2025.lifestyle,
  );
  const medicalRelief = Math.min(
    taxReliefs.medicalRelief,
    MY_RELIEFS_YA_2025.medical,
  );

  const total =
    MY_RELIEFS_YA_2025.individual +
    spouseRelief +
    childUnder18Relief +
    childTertiaryRelief +
    disabledIndividualRelief +
    epfRelief +
    prsRelief +
    socsoRelief +
    lifestyleRelief +
    medicalRelief;

  return {
    individual: MY_RELIEFS_YA_2025.individual,
    spouse: spouseRelief,
    childUnder18: childUnder18Relief,
    childTertiary: childTertiaryRelief,
    disabledIndividual: disabledIndividualRelief,
    epf: epfRelief,
    prs: prsRelief,
    socso: socsoRelief,
    lifestyle: lifestyleRelief,
    medical: medicalRelief,
    total,
  };
}
