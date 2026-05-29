// Romania 2026 salary tax parameters
// Sources: https://www.anaf.ro/ ; https://legislatie.just.ro/

export const RO_TAX_YEAR = 2026;

export const RO_SOURCE_URLS = {
  incomeTax:
    "https://www.anaf.ro/anaf/internet/ANAF/asistenta_contribuabili/persoane_fizice/impozite_si_taxe/impozit_pe_venit",
  socialContributions:
    "https://www.anaf.ro/anaf/internet/ANAF/asistenta_contribuabili/persoane_fizice/impozite_si_taxe/contributii_sociale",
} as const;

export const RO_CAS_RATE = 0.25;
export const RO_CASS_RATE = 0.1;
export const RO_PIT_RATE = 0.1;

/** Annual cap for CAS/CASS base (12 × minimum gross wage, approx. 2026). */
export const RO_SOCIAL_CAP_ANNUAL_2026 = 51_840;

/** Monthly personal deduction formula: max(0, 1310 − 0.066 × gross monthly). */
export const RO_PERSONAL_DEDUCTION_INTERCEPT_MONTHLY = 1_310;
export const RO_PERSONAL_DEDUCTION_SLOPE = 0.066;

/** Additional monthly deduction per dependent child modeled in UI. */
export const RO_DEPENDENT_DEDUCTION_MONTHLY = 100;

/** Voluntary private pension (Pillar III) — excluded from PIT base, max EUR 400/year. */
export const RO_PRIVATE_PENSION_CAP_EUR_2026 = 400;
export const RO_EUR_RON_RATE_2026 = 4.97;
export const RO_PRIVATE_PENSION_CAP_RON_2026 = Math.round(
  RO_PRIVATE_PENSION_CAP_EUR_2026 * RO_EUR_RON_RATE_2026,
);
