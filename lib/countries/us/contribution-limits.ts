// ============================================================================
// 2026 US CONTRIBUTION & DEDUCTION LIMITS
// Sources: IRS Notice 2024-80, IRS Rev. Proc. 2025-25, Pub 15-B (2026)
// ============================================================================

import type { ContributionLimits, USFilingStatus } from "../types";

export type HSACoverageType = "self" | "family";

export const US_LIMITS_2026 = {
  electiveDeferralBase: 24_500,
  electiveDeferralCatchUp: 8_000,
  electiveDeferralSuperCatchUp: 11_250, // ages 60–63
  catchUpAge: 50,
  superCatchUpMinAge: 60,
  superCatchUpMaxAge: 63,

  traditionalIRA: 7_500,
  traditionalIRACatchUp: 1_100,

  rothIRA: 7_500,
  rothIRACatchUp: 1_100,

  hsaSelf: 4_400,
  hsaFamily: 8_750,
  hsaCatchUp: 1_000,
  hsaCatchUpAge: 55,

  healthFsa: 3_400,
  dependentCareFsaJoint: 5_000,
  dependentCareFsaSeparate: 2_500,

  commuterTransitMonthly: 340,
  commuterParkingMonthly: 340,
  commuterMonths: 12,

  studentLoanInterest: 2_500,

  childTaxCreditPerChild: 2_000,
  otherDependentCredit: 500,
  ctcPhaseOutSingle: 200_000,
  ctcPhaseOutMfj: 400_000,
} as const;

export function getElectiveDeferralLimit(age: number): number {
  const { electiveDeferralBase, electiveDeferralCatchUp, electiveDeferralSuperCatchUp } =
    US_LIMITS_2026;
  if (age >= US_LIMITS_2026.superCatchUpMinAge && age <= US_LIMITS_2026.superCatchUpMaxAge) {
    return electiveDeferralBase + electiveDeferralSuperCatchUp;
  }
  if (age >= US_LIMITS_2026.catchUpAge) {
    return electiveDeferralBase + electiveDeferralCatchUp;
  }
  return electiveDeferralBase;
}

export function getIraLimit(age: number, kind: "traditional" | "roth"): number {
  const base =
    kind === "traditional" ? US_LIMITS_2026.traditionalIRA : US_LIMITS_2026.rothIRA;
  const catchUp =
    kind === "traditional"
      ? US_LIMITS_2026.traditionalIRACatchUp
      : US_LIMITS_2026.rothIRACatchUp;
  return age >= US_LIMITS_2026.catchUpAge ? base + catchUp : base;
}

export function getHSALimit(coverageType: HSACoverageType, age: number): number {
  const base =
    coverageType === "self" ? US_LIMITS_2026.hsaSelf : US_LIMITS_2026.hsaFamily;
  return age >= US_LIMITS_2026.hsaCatchUpAge ? base + US_LIMITS_2026.hsaCatchUp : base;
}

export function getDependentCareFsaLimit(filingStatus: USFilingStatus): number {
  return filingStatus === "married_separately"
    ? US_LIMITS_2026.dependentCareFsaSeparate
    : US_LIMITS_2026.dependentCareFsaJoint;
}

export function getCommuterBenefitsLimit(): number {
  return (
    (US_LIMITS_2026.commuterTransitMonthly + US_LIMITS_2026.commuterParkingMonthly) *
    US_LIMITS_2026.commuterMonths
  );
}

export function getUSContributionLimits(
  age: number,
  hsaCoverageType: HSACoverageType,
  filingStatus: USFilingStatus,
): ContributionLimits {
  const deferral = getElectiveDeferralLimit(age);
  return {
    traditional401k: {
      limit: deferral,
      name: "401(k) pre-tax",
      description: "Shares annual elective deferral limit with Roth 401(k)",
      preTax: true,
    },
    roth401k: {
      limit: deferral,
      name: "Roth 401(k)",
      description: "Post-tax; shares elective deferral limit with pre-tax 401(k)",
      preTax: false,
    },
    traditionalIRA: {
      limit: getIraLimit(age, "traditional"),
      name: "Traditional IRA",
      description: "Pre-tax when deductible (simplified model)",
      preTax: true,
    },
    rothIRA: {
      limit: getIraLimit(age, "roth"),
      name: "Roth IRA",
      description: "Post-tax retirement contribution",
      preTax: false,
    },
    hsa: {
      limit: getHSALimit(hsaCoverageType, age),
      name: "HSA",
      description: "Health Savings Account (pre-tax)",
      preTax: true,
    },
    fsa: {
      limit: US_LIMITS_2026.healthFsa,
      name: "Health FSA",
      description: "Pre-tax health flexible spending account",
      preTax: true,
    },
    dependentCareFSA: {
      limit: getDependentCareFsaLimit(filingStatus),
      name: "Dependent Care FSA",
      description: "Pre-tax dependent care FSA",
      preTax: true,
    },
    commuterBenefits: {
      limit: getCommuterBenefitsLimit(),
      name: "Commuter benefits",
      description: "Pre-tax transit and parking (monthly caps annualized)",
      preTax: true,
    },
    studentLoanInterest: {
      limit: US_LIMITS_2026.studentLoanInterest,
      name: "Student loan interest",
      description: "Above-the-line deduction (modeled pre-tax)",
      preTax: true,
    },
  };
}
