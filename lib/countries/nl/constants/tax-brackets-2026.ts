// ============================================================================
// NETHERLANDS TAX BRACKETS (2026)
// Separated into income tax and national insurance (volksverzekeringen)
// Source: Official Belastingdienst (Dutch Tax Authority)
// https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen
// ============================================================================

import type { TaxBracket } from "../../types";

export const NL_SOURCE_URLS = [
  "https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen",
  "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/personeel/u_bent_niet_in_nederland_gevestigd_loonheffingen_inhouden/als_u_loonheffingen_gaat_inhouden/extraterritoriale_kosten_en_de_30procentregeling/voorwaarden_voor_de_30procentregeling1/deskundigheidsvereiste",
  "https://odb.belastingdienst.nl/wp-content/uploads/2025/12/Cijferbijlage-2026-bij-Nieuwsbrief-LH-LH-209-1B61FD_TG.pdf",
  "https://download.belastingdienst.nl/belastingdienst/docs/handboek-loonheffingen-lh0221t61fd.pdf",
  "https://odb.belastingdienst.nl/wp-content/uploads/2026/01/20251218-Overzicht-cijfers-leven-2026-FsL.pdf",
  "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/lijfrente/aftrekken-lijfrentepremies/aftrekken-lijfrentepremies",
] as const;

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

// Belastingdienst 2026 expatregeling salary norms:
// https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/personeel/u_bent_niet_in_nederland_gevestigd_loonheffingen_inhouden/als_u_loonheffingen_gaat_inhouden/extraterritoriale_kosten_en_de_30procentregeling/voorwaarden_voor_de_30procentregeling1/deskundigheidsvereiste
// The annual cap is published in the 2026 wage-tax figures appendix:
// https://odb.belastingdienst.nl/wp-content/uploads/2025/12/Cijferbijlage-2026-bij-Nieuwsbrief-LH-LH-209-1B61FD_TG.pdf
// Employee pension premium treatment is referenced from the official 2026
// Handboek Loonheffingen, which shows withheld employee pension premium as an
// aftrekpost before the wage-tax/national-insurance base:
// https://download.belastingdienst.nl/belastingdienst/docs/handboek-loonheffingen-lh0221t61fd.pdf
export const NL_THIRTY_PERCENT_RULING_2026 = {
  standardSalaryNorm: 48013,
  under30MastersSalaryNorm: 36497,
  maxTaxFreeAllowance: 78600,
  exemptionRate: 0.3,
} as const;

// Belastingdienst 2026 life-insurance/annuity figures:
// https://odb.belastingdienst.nl/wp-content/uploads/2026/01/20251218-Overzicht-cijfers-leven-2026-FsL.pdf
// Belastingdienst annuity deduction guidance:
// https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/lijfrente/aftrekken-lijfrentepremies/aftrekken-lijfrentepremies
export const NL_LIJFRENTE_2026 = {
  annualMarginRate: 0.3,
  maxAnnualMargin: 35589,
  incomeCap: 137800,
  aowFranchise: 19172,
  maxPremiumBase: 118628,
  factorAMultiplier: 6.27,
  maxReserveMargin: 42753,
} as const;
