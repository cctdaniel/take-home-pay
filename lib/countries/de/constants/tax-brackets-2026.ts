// ============================================================================
// GERMANY TAX BRACKETS AND SOCIAL SECURITY CONTRIBUTIONS (2026)
// Tax Year: 2026
// ============================================================================
//
// OFFICIAL SOURCES:
// - German Income Tax Law (Einkommensteuergesetz - EStG) §32a
//   https://www.buzer.de/32a_EStG.htm
// - Federal Ministry of Finance (Bundesfinanzministerium)
//   https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html
// - Social Security Contribution Ceilings 2026
//   https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
// - German Statutory Pension Insurance
//   https://www.deutsche-rentenversicherung.de/
// - National Association of Statutory Health Insurance Funds (vdek)
//   https://www.vdek.com/vertragspartner/arbeitgeber/beitragssaetze.html
//
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// INCOME TAX (Einkommensteuer) - §32a EStG
// Progressive tax with formula-based calculation
// ============================================================================

/**
 * Basic Tax-Free Allowance (Grundfreibetrag)
 * Source: Bundesfinanzministerium - Steuerfortentwicklungsgesetz 2024
 * https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html
 */
export const DE_BASIC_ALLOWANCE_2026 = 12348; // €12,348 per year (single)

/**
 * Income Tax Thresholds (Eckwerte) for 2026
 * Source: §32a Abs. 1 EStG
 */
export const DE_TAX_THRESHOLDS_2026 = {
  // Zone 1: Zero zone (0% tax)
  zone0End: 12348,
  // Zone 2: First progression zone (entry rate ~14% to 23.97%)
  zone1End: 17799,
  // Zone 3: Second progression zone (24% to 42%)
  zone2End: 69878,
  // Zone 4: Top rate zone (42%)
  zone3End: 277825,
  // Zone 5: Wealth tax zone (45%)
};

/**
 * Income Tax Brackets for display purposes
 * Actual calculation uses formula per §32a EStG
 */
export const DE_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 12348,
    rate: 0,
  },
  {
    min: 12348,
    max: 17799,
    rate: 0.14, // Entry rate (approximate, actual formula varies)
  },
  {
    min: 17799,
    max: 69878,
    rate: 0.24, // Lower bound of this bracket
  },
  {
    min: 69878,
    max: 277825,
    rate: 0.42,
  },
  {
    min: 277825,
    max: Infinity,
    rate: 0.45,
  },
];

// ============================================================================
// SOLIDARITY SURCHARGE (Solidaritätszuschlag)
// ============================================================================

/**
 * Solidarity Surcharge Rates and Thresholds for 2026
 * Source: Solidaritätszuschlaggesetz 1995
 * https://www.finanztip.de/solidaritaetszuschlag/
 */
export const DE_SOLIDARITY_SURCHARGE_2026 = {
  rate: 0.055, // 5.5% of income tax
  // Exemption thresholds (Freigrenzen)
  exemptionThresholdSingle: 20350, // Below this: no solidarity surcharge
  exemptionThresholdMarried: 40700, // Double for married couples
  // Full rate threshold (where 5.5% fully applies)
  fullRateThresholdSingle: 37838.28,
  fullRateThresholdMarried: 75676.56,
  // Maximum rate in transition zone (Milderungszone)
  maxTransitionRate: 0.119, // 11.9% of excess over exemption
};

// ============================================================================
// SOCIAL SECURITY CONTRIBUTION CEILINGS (Beitragsbemessungsgrenzen) 2026
// Source: Bundesregierung, Sozialgesetzbuch
// https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
// ============================================================================

export const DE_SOCIAL_SECURITY_CEILINGS_2026 = {
  // Pension and Unemployment Insurance (West and East unified since 2025)
  pensionUnemployment: {
    monthly: 8450,
    annual: 101400,
  },
  // Health and Long-term Care Insurance (unified nationwide)
  healthLongTermCare: {
    monthly: 5812.5,
    annual: 69750,
  },
};

// ============================================================================
// SOCIAL SECURITY CONTRIBUTION RATES 2026
// Source: Deutsche Rentenversicherung, vdek
// ============================================================================

export const DE_SOCIAL_SECURITY_RATES_2026 = {
  // Pension Insurance (Rentenversicherung)
  pension: {
    totalRate: 0.186, // 18.6%
    employeeRate: 0.093, // 9.3%
    employerRate: 0.093, // 9.3%
  },
  // Unemployment Insurance (Arbeitslosenversicherung)
  unemployment: {
    totalRate: 0.026, // 2.6%
    employeeRate: 0.013, // 1.3%
    employerRate: 0.013, // 1.3%
  },
  // Health Insurance (Krankenversicherung)
  health: {
    generalRate: 0.146, // 14.6% base rate
    employeeRate: 0.073, // 7.3%
    employerRate: 0.073, // 7.3%
    // Additional contribution (Zusatzbeitrag) - average ~2.9%, split 50/50
    averageAdditionalContribution: 0.029,
    employeeAdditionalRate: 0.0145, // Half of additional contribution
  },
  // Long-term Care Insurance (Pflegeversicherung)
  longTermCare: {
    totalRate: 0.036, // 3.6% standard
    employeeRate: 0.017, // 1.7%
    employerRate: 0.017, // 1.7%
    // Childless surcharge (Zuschlag für Kinderlose)
    childlessSurcharge: 0.006, // +0.6% for members over 23 without children
    childlessEmployeeRate: 0.025, // 1.7% + 0.8% (employer pays 0.6% extra)
  },
};

// ============================================================================
// CHURCH TAX (Kirchensteuer)
// ============================================================================

/**
 * Church Tax Rates by Federal State
 * Source: German Church Tax Laws
 * https://allaboutberlin.com/glossary/Kirchensteuer
 */
export const DE_CHURCH_TAX_RATES_2026 = {
  // 8% states: Bavaria (Bayern), Baden-Württemberg
  rate8States: ["BY", "BW"],
  rate8: 0.08,
  // 9% states: All other federal states
  rate9: 0.09,
};

// ============================================================================
// TAX CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate German Income Tax using §32a EStG formula
 * This implements the official German income tax formula
 *
 * @param taxableIncome - Annual taxable income (zvE - zu versteuerndes Einkommen)
 * @returns Calculated income tax (rounded down to full euros per §32a Abs. 6 EStG)
 *
 * Source: §32a Abs. 1 EStG
 * https://www.buzer.de/32a_EStG.htm
 */
export function calculateGermanIncomeTax(taxableIncome: number): number {
  // Round down taxable income to full euros (per §32a Abs. 6 EStG)
  const zvE = Math.floor(taxableIncome);
  const {
    zone0End,
    zone1End,
    zone2End,
    zone3End,
  } = DE_TAX_THRESHOLDS_2026;

  let tax = 0;

  if (zvE <= zone0End) {
    // Zone 1: Zero zone - no tax
    tax = 0;
  } else if (zvE <= zone1End) {
    // Zone 2: First progression zone
    // Formula: (914.51 × y + 1,400) × y
    // where y = (zvE - 12,348) / 10,000
    const y = (zvE - zone0End) / 10000;
    tax = (914.51 * y + 1400) * y;
  } else if (zvE <= zone2End) {
    // Zone 3: Second progression zone
    // Formula: (173.10 × z + 2,397) × z + 1,034.87
    // where z = (zvE - 17,799) / 10,000
    const z = (zvE - zone1End) / 10000;
    tax = (173.1 * z + 2397) * z + 1034.87;
  } else if (zvE <= zone3End) {
    // Zone 4: Top rate (42%)
    // Formula: 0.42 × zvE - 11,135.63
    tax = 0.42 * zvE - 11135.63;
  } else {
    // Zone 5: Wealth tax (45%)
    // Formula: 0.45 × zvE - 19,470.38
    tax = 0.45 * zvE - 19470.38;
  }

  // Round down to full euros (per §32a Abs. 6 EStG)
  return Math.floor(tax);
}

/**
 * Calculate Solidarity Surcharge (Solidaritätszuschlag)
 *
 * Rules:
 * - Standard rate: 5.5% of income tax
 * - Exemption: No surcharge if income tax <= €20,350 (single) / €40,700 (married)
 * - Transition zone: Between exemption and €37,838.28, gradual increase using Milderungszone
 * - Full rate: 5.5% applies above €37,838.28 income tax
 *
 * @param incomeTax - Annual income tax amount
 * @param isMarried - Whether married (affects exemption threshold)
 * @returns Calculated solidarity surcharge
 *
 * Source: Solidaritätszuschlaggesetz §4
 * https://www.finanztip.de/solidaritaetszuschlag/
 */
export function calculateSolidaritySurcharge(
  incomeTax: number,
  isMarried: boolean,
): number {
  const {
    exemptionThresholdSingle,
    exemptionThresholdMarried,
    fullRateThresholdSingle,
    rate,
  } = DE_SOLIDARITY_SURCHARGE_2026;

  const exemptionThreshold = isMarried
    ? exemptionThresholdMarried
    : exemptionThresholdSingle;
  const fullRateThreshold = isMarried
    ? fullRateThresholdSingle * 2
    : fullRateThresholdSingle;

  // Below exemption threshold: no solidarity surcharge
  if (incomeTax <= exemptionThreshold) {
    return 0;
  }

  // Full rate applies
  if (incomeTax >= fullRateThreshold) {
    return Math.round(incomeTax * rate);
  }

  // Transition zone (Milderungszone): gradual increase
  // The surcharge cannot exceed 11.9% of the difference between
  // income tax and exemption threshold
  const excess = incomeTax - exemptionThreshold;
  const maxSurcharge = excess * 0.119; // 11.9%

  // Also calculate standard 5.5%
  const standardSurcharge = incomeTax * rate;

  // Take the minimum (capped at 11.9% of excess)
  return Math.round(Math.min(standardSurcharge, maxSurcharge));
}

/**
 * Calculate Social Security Contributions
 *
 * @param grossSalary - Annual gross salary
 * @param isChildless - Whether the employee is childless and over 23 (affects Pflegeversicherung)
 * @returns Object with all social security contributions
 */
export function calculateSocialSecurity(
  grossSalary: number,
  isChildless: boolean,
): {
  pension: number;
  unemployment: number;
  health: number;
  longTermCare: number;
  total: number;
  details: {
    pension: { employee: number; employer: number; total: number };
    unemployment: { employee: number; employer: number; total: number };
    health: { employee: number; employer: number; total: number };
    longTermCare: { employee: number; employer: number; total: number };
  };
} {
  const {
    pensionUnemployment,
    healthLongTermCare,
  } = DE_SOCIAL_SECURITY_CEILINGS_2026;
  const rates = DE_SOCIAL_SECURITY_RATES_2026;

  // Calculate bases (capped at contribution ceilings)
  const pensionBase = Math.min(grossSalary, pensionUnemployment.annual);
  const unemploymentBase = Math.min(grossSalary, pensionUnemployment.annual);
  const healthBase = Math.min(grossSalary, healthLongTermCare.annual);
  const careBase = Math.min(grossSalary, healthLongTermCare.annual);

  // Pension Insurance
  const pensionEmployee = pensionBase * rates.pension.employeeRate;
  const pensionEmployer = pensionBase * rates.pension.employerRate;
  const pensionTotal = pensionEmployee + pensionEmployer;

  // Unemployment Insurance
  const unemploymentEmployee = unemploymentBase * rates.unemployment.employeeRate;
  const unemploymentEmployer = unemploymentBase * rates.unemployment.employerRate;
  const unemploymentTotal = unemploymentEmployee + unemploymentEmployer;

  // Health Insurance (including additional contribution)
  const healthEmployeeBase = healthBase * rates.health.employeeRate;
  const healthEmployeeAdditional = healthBase * rates.health.employeeAdditionalRate;
  const healthEmployee = healthEmployeeBase + healthEmployeeAdditional;
  const healthEmployer =
    healthBase * rates.health.employerRate +
    healthBase * rates.health.employeeAdditionalRate; // Employer pays half of additional
  const healthTotal = healthEmployee + healthEmployer;

  // Long-term Care Insurance
  let careEmployee: number;
  let careEmployer: number;
  if (isChildless) {
    // Childless surcharge: employee pays 2.5%, employer pays 1.1% (total 3.6% + 0.6% = 4.2%)
    careEmployee = careBase * rates.longTermCare.childlessEmployeeRate;
    careEmployer = careBase * (rates.longTermCare.totalRate + rates.longTermCare.childlessSurcharge - rates.longTermCare.childlessEmployeeRate);
  } else {
    careEmployee = careBase * rates.longTermCare.employeeRate;
    careEmployer = careBase * rates.longTermCare.employerRate;
  }
  const careTotal = careEmployee + careEmployer;

  // Employee total contributions (deducted from salary)
  const employeeTotal =
    pensionEmployee + unemploymentEmployee + healthEmployee + careEmployee;

  return {
    pension: Math.round(pensionEmployee),
    unemployment: Math.round(unemploymentEmployee),
    health: Math.round(healthEmployee),
    longTermCare: Math.round(careEmployee),
    total: Math.round(employeeTotal),
    details: {
      pension: {
        employee: Math.round(pensionEmployee),
        employer: Math.round(pensionEmployer),
        total: Math.round(pensionTotal),
      },
      unemployment: {
        employee: Math.round(unemploymentEmployee),
        employer: Math.round(unemploymentEmployer),
        total: Math.round(unemploymentTotal),
      },
      health: {
        employee: Math.round(healthEmployee),
        employer: Math.round(healthEmployer),
        total: Math.round(healthTotal),
      },
      longTermCare: {
        employee: Math.round(careEmployee),
        employer: Math.round(careEmployer),
        total: Math.round(careTotal),
      },
    },
  };
}

/**
 * Calculate Church Tax (Kirchensteuer)
 *
 * @param incomeTax - Annual income tax amount
 * @param stateCode - Two-letter state code (e.g., "BY" for Bavaria, "BE" for Berlin)
 * @returns Church tax amount (0 if not a church member)
 */
export function calculateChurchTax(
  incomeTax: number,
  stateCode: string,
  isChurchMember: boolean,
): number {
  if (!isChurchMember) {
    return 0;
  }

  const rate = DE_CHURCH_TAX_RATES_2026.rate8States.includes(stateCode)
    ? DE_CHURCH_TAX_RATES_2026.rate8
    : DE_CHURCH_TAX_RATES_2026.rate9;

  return Math.round(incomeTax * rate);
}
