// ============================================================================
// NETHERLANDS TAX CREDITS (2026)
// Source: Official Belastingdienst (Dutch Tax Authority)
// https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen
// ============================================================================

// ============================================================================
// GENERAL TAX CREDIT (Algemene Heffingskorting)
// For taxpayers under state pension age (AOW)
// ============================================================================
export const GENERAL_TAX_CREDIT = {
  maxCredit: 3115, // Maximum credit amount
  phaseOutStart: 29736, // Income threshold where phase-out begins
  phaseOutEnd: 78426, // Income threshold where credit reaches zero
  phaseOutRate: 0.06398, // 6.398% reduction per euro above threshold
};

/**
 * Calculate the general tax credit (algemene heffingskorting) based on income.
 * The credit phases out linearly between €28,406 and €76,817.
 */
export function calculateGeneralTaxCredit(income: number): number {
  if (income <= GENERAL_TAX_CREDIT.phaseOutStart) {
    return GENERAL_TAX_CREDIT.maxCredit;
  }

  if (income >= GENERAL_TAX_CREDIT.phaseOutEnd) {
    return 0;
  }

  // Calculate reduction based on income above threshold
  const reduction =
    GENERAL_TAX_CREDIT.phaseOutRate *
    (income - GENERAL_TAX_CREDIT.phaseOutStart);

  return Math.max(0, GENERAL_TAX_CREDIT.maxCredit - reduction);
}

// ============================================================================
// LABOR TAX CREDIT (Arbeidskorting)
// For taxpayers under state pension age (AOW)
// Uses tiered build-up and phase-out formula
// ============================================================================
export const LABOR_TAX_CREDIT = {
  // Tier 1: 0 to €11,965 - build-up at 8.324%
  tier1Threshold: 11965,
  tier1Rate: 0.08324,

  // Tier 2: €11,965 to €25,845 - build-up at 31.009%
  tier2Threshold: 25845,
  tier2Base: 996, // Amount at start of tier 2
  tier2Rate: 0.31009,

  // Tier 3: €25,845 to €45,592 - build-up at 1.950%
  tier3Threshold: 45592,
  tier3Base: 5300, // Amount at start of tier 3
  tier3Rate: 0.0195,

  // Tier 4: €45,592 to €132,920 - phase-out at 6.510%
  tier4Threshold: 132920,
  tier4Base: 5685, // Maximum credit amount (at €45,592)
  tier4Rate: 0.0651,

  // Above €132,920: credit is €0
};

/**
 * Calculate the labor tax credit (arbeidskorting) based on labor income.
 * The credit builds up in tiers, reaches maximum around €43,071,
 * then phases out to zero at €129,078.
 */
export function calculateLaborTaxCredit(income: number): number {
  if (income <= 0) {
    return 0;
  }

  const {
    tier1Threshold,
    tier1Rate,
    tier2Threshold,
    tier2Base,
    tier2Rate,
    tier3Threshold,
    tier3Base,
    tier3Rate,
    tier4Threshold,
    tier4Base,
    tier4Rate,
  } = LABOR_TAX_CREDIT;

  // Tier 1: 8.053% of income up to €12,169
  if (income <= tier1Threshold) {
    return income * tier1Rate;
  }

  // Tier 2: €980 + 30.030% of income above €12,169
  if (income <= tier2Threshold) {
    return tier2Base + tier2Rate * (income - tier1Threshold);
  }

  // Tier 3: €5,220 + 2.258% of income above €26,288
  if (income <= tier3Threshold) {
    return tier3Base + tier3Rate * (income - tier2Threshold);
  }

  // Tier 4: €5,599 - 6.510% of income above €43,071 (phase-out)
  if (income <= tier4Threshold) {
    const reduction = tier4Rate * (income - tier3Threshold);
    return Math.max(0, tier4Base - reduction);
  }

  // Above €129,078: no credit
  return 0;
}

// ============================================================================
// IACK - Income-Related Combination Tax Credit
// (Inkomensafhankelijke Combinatiekorting)
// For working parents with children under 12
// ============================================================================
export const IACK = {
  minIncome: 6239, // Minimum income to qualify
  maxIncome: 32710, // Income threshold for maximum credit
  maxCredit: 3032, // Maximum credit amount
  buildUpRate: 0.1145, // 11.45% build-up rate
};

/**
 * Calculate the IACK (income-related combination tax credit).
 * Available to working parents with children under 12 registered at their address.
 * The credit builds up from €6,239 to €32,710, then caps at €3,032.
 */
export function calculateIACK(
  income: number,
  hasYoungChildren: boolean,
): number {
  // IACK only applies if the taxpayer has children under 12
  if (!hasYoungChildren) {
    return 0;
  }

  // No credit below minimum income threshold
  if (income <= IACK.minIncome) {
    return 0;
  }

  // Maximum credit above threshold
  if (income >= IACK.maxIncome) {
    return IACK.maxCredit;
  }

  // Build-up: 11.45% of income above €6,239
  return IACK.buildUpRate * (income - IACK.minIncome);
}
