// Re-exports for backwards compatibility
export {
  US_LIMITS_2026,
  getElectiveDeferralLimit,
  getIraLimit,
  getHSALimit,
  getDependentCareFsaLimit,
  getCommuterBenefitsLimit,
  getUSContributionLimits,
  type HSACoverageType,
} from "../contribution-limits";

import { US_LIMITS_2026 } from "../contribution-limits";

/** @deprecated Use getElectiveDeferralLimit(age) or getUSContributionLimits */
export const CONTRIBUTION_LIMITS = {
  traditional401k: US_LIMITS_2026.electiveDeferralBase,
  traditional401kCatchUp: US_LIMITS_2026.electiveDeferralCatchUp,
  traditional401kSuperCatchUp: US_LIMITS_2026.electiveDeferralSuperCatchUp,
  rothIRA: US_LIMITS_2026.rothIRA,
  rothIRACatchUp: US_LIMITS_2026.rothIRACatchUp,
  hsaSelf: US_LIMITS_2026.hsaSelf,
  hsaFamily: US_LIMITS_2026.hsaFamily,
  hsaCatchUp: US_LIMITS_2026.hsaCatchUp,
} as const;

export const CONTRIBUTION_LIMITS_2025 = CONTRIBUTION_LIMITS;
