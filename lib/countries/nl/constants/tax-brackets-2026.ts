// ============================================================================
// NETHERLANDS TAX BRACKETS (2026)
// Combined income tax + national insurance for those under AOW age
// ============================================================================

import type { TaxBracket } from "../../types";

export const NETHERLANDS_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 75518,
    rate: 0.3697,
  },
  {
    min: 75518,
    max: Infinity,
    rate: 0.495,
  },
];
