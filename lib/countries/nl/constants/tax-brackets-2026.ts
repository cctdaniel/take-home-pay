// ============================================================================
// NETHERLANDS TAX BRACKETS (2026)
// Combined income tax + national insurance for those under AOW age
// Source: Official Belastingdienst (Dutch Tax Authority)
// https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen
// ============================================================================

import type { TaxBracket } from "../../types";

export const NETHERLANDS_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 38883,
    rate: 0.3575, // 35.75%
  },
  {
    min: 38883,
    max: 78426,
    rate: 0.3756, // 37.56%
  },
  {
    min: 78426,
    max: Infinity,
    rate: 0.495, // 49.50%
  },
];
