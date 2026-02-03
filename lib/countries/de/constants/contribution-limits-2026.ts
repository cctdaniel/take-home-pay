// ============================================================================
// GERMANY VOLUNTARY CONTRIBUTION LIMITS (2026)
// ============================================================================
//
// Sources:
// - bAV (Entgeltumwandlung) tax-free limit: §3 Nr. 63 EStG (8% of BBG)
// - BBG 2026: Bundesregierung (Beitragsbemessungsgrenzen)
// - Riester maximum eligible contributions: §10a EStG (max 2,100 EUR incl. allowances)
// - Ruerup (Basisrente) maximum deductible contributions: 30,826 EUR single / 61,652 EUR married
//
// ============================================================================

import { DE_SOCIAL_SECURITY_CEILINGS_2026 } from "./tax-brackets-2026";

// Occupational pension (bAV / Entgeltumwandlung) - tax-free up to 8% of BBG
export const DE_BAV_TAX_FREE_RATE = 0.08;
export const DE_BAV_TAX_FREE_LIMIT_2026 = Math.round(
  DE_SOCIAL_SECURITY_CEILINGS_2026.pensionUnemployment.annual * DE_BAV_TAX_FREE_RATE,
);

// Riester pension - max eligible contribution (incl. allowances)
export const DE_RIESTER_MAX_2026 = 2100;

// Ruerup (Basisrente) - max deductible contribution
export const DE_RUERUP_MAX_SINGLE_2026 = 30826;
export const DE_RUERUP_MAX_MARRIED_2026 = 61652;
