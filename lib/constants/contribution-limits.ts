// ============================================================================
// 2026 CONTRIBUTION LIMITS
// Source: IRS announcements (released late 2025)
// ============================================================================

export const CONTRIBUTION_LIMITS = {
  // 401(k) limits
  traditional401k: 24000,        // Up from $23,500 in 2025
  traditional401kCatchUp: 7500,  // For age 50+
  traditional401kSuperCatchUp: 11250, // For ages 60-63 (new SECURE 2.0 provision)

  // IRA limits
  rothIRA: 7000,                 // Same as 2025
  rothIRACatchUp: 1000,          // For age 50+

  // HSA limits
  hsaSelf: 4400,                 // Up from $4,300 in 2025
  hsaFamily: 8750,               // Up from $8,550 in 2025
  hsaCatchUp: 1000,              // For age 55+
} as const;

export type HSACoverageType = "self" | "family";

export function getHSALimit(coverageType: HSACoverageType): number {
  return coverageType === "self"
    ? CONTRIBUTION_LIMITS.hsaSelf
    : CONTRIBUTION_LIMITS.hsaFamily;
}

// For backwards compatibility
export const CONTRIBUTION_LIMITS_2025 = CONTRIBUTION_LIMITS;
