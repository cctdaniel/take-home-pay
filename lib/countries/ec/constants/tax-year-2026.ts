import type { TaxBracket } from "../../types";

// Ecuador salary tax parameters — 2026
// Sources: https://www.sri.gob.ec/ | https://www.iess.gob.ec/

export const EC_TAX_YEAR = 2026;

export const EC_SOURCE_URLS = {
  incomeTax: "https://www.sri.gob.ec/",
  socialSecurity: "https://www.iess.gob.ec/",
} as const;

/** IESS employee contribution rate on insurable salary. */
export const EC_IESS_EMPLOYEE_RATE = 0.0945;

/** Maximum annual IESS contribution base (USD). */
export const EC_IESS_ANNUAL_CAP = 45_000;

/** Basic exempt fraction on income after IESS (USD, SRI 2026 table). */
export const EC_PIT_BASIC_EXEMPT_2026 = 12_208;

/** Progressive PIT on annual income after IESS (SRI salary withholding table). */
export const EC_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: EC_PIT_BASIC_EXEMPT_2026, rate: 0 },
  { min: EC_PIT_BASIC_EXEMPT_2026, max: 14_930, rate: 0.05 },
  { min: 14_930, max: 18_637, rate: 0.1 },
  { min: 18_637, max: 22_344, rate: 0.15 },
  { min: 22_344, max: 43_590, rate: 0.2 },
  { min: 43_590, max: 64_836, rate: 0.25 },
  { min: 64_836, max: 86_082, rate: 0.3 },
  { min: 86_082, max: 114_744, rate: 0.35 },
  { min: 114_744, max: Infinity, rate: 0.37 },
];
