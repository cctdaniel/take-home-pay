// ============================================================================
// 2026 US CONTRIBUTION LIMITS
// Sources:
// - IRS Notice 2025-67 for 2026 retirement plan limits:
//   https://www.irs.gov/pub/irs-drop/n-25-67.pdf
// - Rev. Proc. 2025-19 for 2026 HSA limits:
//   https://www.irs.gov/irb/2025-21_IRB
// - Rev. Proc. 2025-32 / IRS IR-2025-103 for 2026 health FSA limit:
//   https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
// - IRS Publication 15-B (2026) for dependent-care assistance exclusion:
//   https://www.irs.gov/publications/p15b
// ============================================================================

import type { ContributionLimits } from "../../types";

export const CONTRIBUTION_LIMITS = {
  // 401(k) limits
  traditional401k: 24500,
  traditional401kCatchUp: 8000,
  traditional401kSuperCatchUp: 11250, // For ages 60-63 (new SECURE 2.0 provision)

  // IRA limits
  rothIRA: 7500,
  rothIRACatchUp: 1100,

  // HSA limits
  hsaSelf: 4400,
  hsaFamily: 8750,
  hsaCatchUp: 1000,

  // Section 125 cafeteria plan limits
  healthFsa: 3400,
  dependentCareFsa: 7500,
  dependentCareFsaMarriedSeparately: 3750,
} as const;

export type HSACoverageType = "self" | "family";

export function getHSALimit(coverageType: HSACoverageType): number {
  return coverageType === "self"
    ? CONTRIBUTION_LIMITS.hsaSelf
    : CONTRIBUTION_LIMITS.hsaFamily;
}

// Get contribution limits as a ContributionLimits interface
export function getUSContributionLimits(
  hsaCoverageType: HSACoverageType = "self",
  filingStatus: "single" | "married_jointly" | "married_separately" | "head_of_household" = "single",
): ContributionLimits {
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
    healthFsa: {
      limit: CONTRIBUTION_LIMITS.healthFsa,
      name: "Health FSA",
      description: "Health flexible spending arrangement salary reduction",
      preTax: true,
    },
    dependentCareFsa: {
      limit:
        filingStatus === "married_separately"
          ? CONTRIBUTION_LIMITS.dependentCareFsaMarriedSeparately
          : CONTRIBUTION_LIMITS.dependentCareFsa,
      name: "Dependent Care FSA",
      description: "Dependent care assistance exclusion from wages",
      preTax: true,
    },
  };
}

// For backwards compatibility
export const CONTRIBUTION_LIMITS_2025 = CONTRIBUTION_LIMITS;
