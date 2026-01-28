// ============================================================================
// 2026 US CONTRIBUTION LIMITS
// Source: IRS announcements (released late 2025)
// ============================================================================

import type { ContributionLimits } from "../../types";

export const CONTRIBUTION_LIMITS = {
  // 401(k) limits
  traditional401k: 24000,
  traditional401kCatchUp: 7500,
  traditional401kSuperCatchUp: 11250, // For ages 60-63 (new SECURE 2.0 provision)

  // IRA limits
  rothIRA: 7000,
  rothIRACatchUp: 1000,

  // HSA limits
  hsaSelf: 4400,
  hsaFamily: 8750,
  hsaCatchUp: 1000,
} as const;

export type HSACoverageType = "self" | "family";

export function getHSALimit(coverageType: HSACoverageType): number {
  return coverageType === "self"
    ? CONTRIBUTION_LIMITS.hsaSelf
    : CONTRIBUTION_LIMITS.hsaFamily;
}

// Get contribution limits as a ContributionLimits interface
export function getUSContributionLimits(hsaCoverageType: HSACoverageType = "self"): ContributionLimits {
  return {
    traditional401k: {
      limit: CONTRIBUTION_LIMITS.traditional401k,
      name: "401(k)",
      description: "Pre-tax retirement contribution",
      preTax: true,
    },
    rothIRA: {
      limit: CONTRIBUTION_LIMITS.rothIRA,
      name: "Roth IRA",
      description: "Post-tax retirement contribution",
      preTax: false,
    },
    hsa: {
      limit: getHSALimit(hsaCoverageType),
      name: "HSA",
      description: "Health Savings Account (pre-tax)",
      preTax: true,
    },
  };
}

// For backwards compatibility
export const CONTRIBUTION_LIMITS_2025 = CONTRIBUTION_LIMITS;
