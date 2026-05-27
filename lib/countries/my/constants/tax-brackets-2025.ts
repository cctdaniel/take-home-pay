import type { MYTaxReliefInputs, TaxBracket } from "../../types";

export const MY_SOURCE_URLS = [
  "https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-rate/",
  "https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/non-resident/",
  "https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-reliefs/",
  "https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/donations-gifts/",
  "https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/rebates/",
  "https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution",
  "https://www.kwsp.gov.my/en/employer/responsibilities/non-malaysian-citizen-employees",
  "https://www.kwsp.gov.my/en/member/contribution/i-saraan",
  "https://www.perkeso.gov.my/en/our-services/protection/pekerja-bermajikan.html",
] as const;

// ============================================================================
// MALAYSIA INDIVIDUAL TAX AND EMPLOYEE CONTRIBUTION CONSTANTS
// Tax data: Year of Assessment 2025, used as the latest published resident
// individual table available on HASiL/LHDN at implementation time.
// Sources:
// - Resident individual rates: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-rate/
// - Non-resident rates: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/non-resident/
// - Reliefs YA 2025: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-reliefs/
// - Donations/gifts: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/donations-gifts/
// - Rebates: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/rebates/
// - EPF/KWSP rates effective Oct 2025 wages: https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution
// - Non-Malaysian EPF expansion: https://www.kwsp.gov.my/en/employer/responsibilities/non-malaysian-citizen-employees
// - EPF/KWSP voluntary contribution limit: https://www.kwsp.gov.my/en/member/contribution/i-saraan
// - PERKESO employee rates and RM6,000 ceiling: https://www.perkeso.gov.my/en/our-services/protection/pekerja-bermajikan.html
// ============================================================================

export const MY_TAX_BRACKETS_YA_2025: TaxBracket[] = [
  { min: 0, max: 5_000, rate: 0 },
  { min: 5_000, max: 20_000, rate: 0.01 },
  { min: 20_000, max: 35_000, rate: 0.03 },
  { min: 35_000, max: 50_000, rate: 0.06 },
  { min: 50_000, max: 70_000, rate: 0.11 },
  { min: 70_000, max: 100_000, rate: 0.19 },
  { min: 100_000, max: 400_000, rate: 0.25 },
  { min: 400_000, max: 600_000, rate: 0.26 },
  { min: 600_000, max: 2_000_000, rate: 0.28 },
  { min: 2_000_000, max: Infinity, rate: 0.3 },
];

export const MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE = 0.3;

export const MY_RELIEFS_YA_2025 = {
  individual: 9_000,
  parentMedical: 8_000,
  supportingEquipment: 6_000,
  selfEducation: 7_000,
  spouse: 4_000,
  disabledSpouse: 6_000,
  childUnder18: 2_000,
  child18PlusEducation: 2_000,
  childTertiary: 8_000,
  disabledChild: 8_000,
  disabledChildTertiaryAdditional: 8_000,
  disabledIndividual: 7_000,
  epfRetirement: 4_000,
  lifeInsurance: 3_000,
  prs: 3_000,
  educationMedicalInsurance: 4_000,
  socso: 350,
  lifestyle: 2_500,
  sportsLifestyle: 1_000,
  medical: 10_000,
  breastfeedingEquipment: 1_000,
  childcare: 3_000,
  sspn: 8_000,
  evCharging: 2_500,
  firstHomeLoanInterestUpTo500k: 7_000,
  firstHomeLoanInterest500kTo750k: 5_000,
  approvedDonationRate: 0.1,
  residentIndividualRebateChargeableIncomeThreshold: 35_000,
  residentIndividualRebate: 400,
  residentSpouseRebate: 400,
  departureLevyRebate: 300,
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

function clampRelief(value: number, limit: number) {
  return Math.min(Math.max(0, value || 0), limit);
}

export function getMYFirstHomeLoanInterestLimit(
  priceBand: MYTaxReliefInputs["firstHomePriceBand"],
) {
  if (priceBand === "up_to_500k") {
    return MY_RELIEFS_YA_2025.firstHomeLoanInterestUpTo500k;
  }

  if (priceBand === "500k_to_750k") {
    return MY_RELIEFS_YA_2025.firstHomeLoanInterest500kTo750k;
  }

  return 0;
}

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
  grossSalary,
  epfEmployee,
  voluntaryEpf,
  prsContribution,
  socsoEmployee,
}: {
  taxReliefs: MYTaxReliefInputs;
  grossSalary: number;
  epfEmployee: number;
  voluntaryEpf: number;
  prsContribution: number;
  socsoEmployee: number;
}) {
  const spouseRelief = taxReliefs.hasSpouseRelief ? MY_RELIEFS_YA_2025.spouse : 0;
  const disabledSpouseRelief = taxReliefs.hasDisabledSpouseRelief
    ? MY_RELIEFS_YA_2025.disabledSpouse
    : 0;
  const childUnder18Relief =
    Math.max(0, taxReliefs.numberOfChildrenUnder18) *
    MY_RELIEFS_YA_2025.childUnder18;
  const child18PlusEducationRelief =
    Math.max(0, taxReliefs.numberOfChildren18PlusEducation) *
    MY_RELIEFS_YA_2025.child18PlusEducation;
  const childTertiaryRelief =
    Math.max(0, taxReliefs.numberOfChildrenTertiary) *
    MY_RELIEFS_YA_2025.childTertiary;
  const disabledChildRelief =
    Math.max(0, taxReliefs.numberOfDisabledChildren) *
    MY_RELIEFS_YA_2025.disabledChild;
  const disabledChildTertiaryRelief =
    Math.max(0, taxReliefs.numberOfDisabledChildrenTertiary) *
    MY_RELIEFS_YA_2025.disabledChildTertiaryAdditional;
  const disabledIndividualRelief = taxReliefs.isDisabled
    ? MY_RELIEFS_YA_2025.disabledIndividual
    : 0;
  const parentMedicalRelief = clampRelief(
    taxReliefs.parentMedicalRelief,
    MY_RELIEFS_YA_2025.parentMedical,
  );
  const supportingEquipmentRelief = clampRelief(
    taxReliefs.supportingEquipmentRelief,
    MY_RELIEFS_YA_2025.supportingEquipment,
  );
  const selfEducationRelief = clampRelief(
    taxReliefs.selfEducationFees,
    MY_RELIEFS_YA_2025.selfEducation,
  );
  const epfRelief = Math.min(
    epfEmployee + voluntaryEpf,
    MY_RELIEFS_YA_2025.epfRetirement,
  );
  const voluntaryEpfRemainingForLifeBucket = Math.max(
    0,
    voluntaryEpf - Math.max(0, MY_RELIEFS_YA_2025.epfRetirement - epfEmployee),
  );
  const lifeInsuranceRelief = Math.min(
    Math.max(0, taxReliefs.lifeInsuranceRelief || 0) +
      voluntaryEpfRemainingForLifeBucket,
    MY_RELIEFS_YA_2025.lifeInsurance,
  );
  const prsRelief = Math.min(prsContribution, MY_RELIEFS_YA_2025.prs);
  const socsoRelief = Math.min(socsoEmployee, MY_RELIEFS_YA_2025.socso);
  const lifestyleRelief = clampRelief(
    taxReliefs.lifestyleRelief,
    MY_RELIEFS_YA_2025.lifestyle,
  );
  const sportsLifestyleRelief = clampRelief(
    taxReliefs.sportsLifestyleRelief,
    MY_RELIEFS_YA_2025.sportsLifestyle,
  );
  const medicalRelief = clampRelief(
    taxReliefs.medicalRelief,
    MY_RELIEFS_YA_2025.medical,
  );
  const breastfeedingEquipmentRelief = clampRelief(
    taxReliefs.breastfeedingEquipmentRelief,
    MY_RELIEFS_YA_2025.breastfeedingEquipment,
  );
  const childcareRelief = clampRelief(
    taxReliefs.childcareFees,
    MY_RELIEFS_YA_2025.childcare,
  );
  const sspnRelief = clampRelief(
    taxReliefs.sspnNetSavings,
    MY_RELIEFS_YA_2025.sspn,
  );
  const educationMedicalInsuranceRelief = clampRelief(
    taxReliefs.educationMedicalInsurance,
    MY_RELIEFS_YA_2025.educationMedicalInsurance,
  );
  const evChargingRelief = clampRelief(
    taxReliefs.evChargingRelief,
    MY_RELIEFS_YA_2025.evCharging,
  );
  const firstHomeLoanInterestRelief = clampRelief(
    taxReliefs.firstHomeLoanInterest,
    getMYFirstHomeLoanInterestLimit(taxReliefs.firstHomePriceBand),
  );
  const approvedDonationRelief = Math.min(
    Math.max(0, taxReliefs.approvedDonations || 0),
    MY_RELIEFS_YA_2025.approvedDonationRate * Math.max(0, grossSalary),
  );

  const total =
    MY_RELIEFS_YA_2025.individual +
    spouseRelief +
    disabledSpouseRelief +
    childUnder18Relief +
    child18PlusEducationRelief +
    childTertiaryRelief +
    disabledChildRelief +
    disabledChildTertiaryRelief +
    disabledIndividualRelief +
    parentMedicalRelief +
    supportingEquipmentRelief +
    selfEducationRelief +
    epfRelief +
    lifeInsuranceRelief +
    prsRelief +
    socsoRelief +
    lifestyleRelief +
    sportsLifestyleRelief +
    medicalRelief +
    breastfeedingEquipmentRelief +
    childcareRelief +
    sspnRelief +
    educationMedicalInsuranceRelief +
    evChargingRelief +
    firstHomeLoanInterestRelief +
    approvedDonationRelief;

  return {
    individual: MY_RELIEFS_YA_2025.individual,
    spouse: spouseRelief,
    disabledSpouse: disabledSpouseRelief,
    childUnder18: childUnder18Relief,
    child18PlusEducation: child18PlusEducationRelief,
    childTertiary: childTertiaryRelief,
    disabledChild: disabledChildRelief,
    disabledChildTertiary: disabledChildTertiaryRelief,
    disabledIndividual: disabledIndividualRelief,
    parentMedical: parentMedicalRelief,
    supportingEquipment: supportingEquipmentRelief,
    selfEducation: selfEducationRelief,
    epf: epfRelief,
    lifeInsurance: lifeInsuranceRelief,
    prs: prsRelief,
    socso: socsoRelief,
    lifestyle: lifestyleRelief,
    sportsLifestyle: sportsLifestyleRelief,
    medical: medicalRelief,
    breastfeedingEquipment: breastfeedingEquipmentRelief,
    childcare: childcareRelief,
    sspn: sspnRelief,
    educationMedicalInsurance: educationMedicalInsuranceRelief,
    evCharging: evChargingRelief,
    firstHomeLoanInterest: firstHomeLoanInterestRelief,
    approvedDonations: approvedDonationRelief,
    total,
  };
}
