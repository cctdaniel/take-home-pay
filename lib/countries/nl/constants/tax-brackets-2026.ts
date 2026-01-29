// ============================================================================
// NETHERLANDS TAX BRACKETS (2026)
// Separated into income tax and national insurance (volksverzekeringen)
// Source: Official Belastingdienst (Dutch Tax Authority)
// https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// NATIONAL INSURANCE RATES (Volksverzekeringen) - 2026
// These are capped at the first bracket threshold (€38,883)
// ============================================================================
export const NL_SOCIAL_SECURITY_RATES_2026 = {
  aow: 0.179, // 17.90% - General Old Age Pensions Act
  anw: 0.001, // 0.10% - National Survivor Benefits Act
  wlz: 0.0965, // 9.65% - Long-term Care Act
  total: 0.2765, // 27.65% combined
  ceiling: 38883, // Social security only applies up to this amount
};

// ============================================================================
// INCOME TAX RATES (Inkomstenbelasting) - 2026
// Pure income tax portion (combined rate minus social security)
// ============================================================================
export const NL_INCOME_TAX_RATES_2026 = {
  bracket1Rate: 0.081, // 8.10% (35.75% - 27.65% social security)
  bracket2Rate: 0.3756, // 37.56% (no social security above bracket 1)
  bracket3Rate: 0.495, // 49.50% (no social security above bracket 1)
};

// ============================================================================
// COMBINED TAX BRACKETS (for reference / backwards compatibility)
// ============================================================================
export const NETHERLANDS_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 38883,
    rate: 0.3575, // 35.75% = 8.10% income tax + 27.65% social security
  },
  {
    min: 38883,
    max: 78426,
    rate: 0.3756, // 37.56% = pure income tax (social security capped)
  },
  {
    min: 78426,
    max: Infinity,
    rate: 0.495, // 49.50% = pure income tax
  },
];
