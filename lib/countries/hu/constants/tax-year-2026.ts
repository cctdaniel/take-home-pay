// Hungary 2026 salary tax parameters
// Sources: https://nav.gov.hu/

export const HU_TAX_YEAR = 2026;

export const HU_SOURCE_URLS = {
  personalIncomeTax:
    "https://nav.gov.hu/ado/egyeb/ado/adozas/adozas_szja",
  socialSecurity:
    "https://nav.gov.hu/ado/egyeb/ado/adozas/adozas_tb",
  familyAllowance:
    "https://nav.gov.hu/ado/egyeb/ado/adozas/adozas_csaladi",
} as const;

export const HU_PIT_RATE = 0.15;
export const HU_SOCIAL_SECURITY_EMPLOYEE_RATE = 0.185;
export const HU_FAMILY_ALLOWANCE_MONTHLY_PER_CHILD = 66_670;

/** Voluntary pension fund (önkéntes nyugdíjpénztár) — PIT base reduction cap 2026. */
export const HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026 = 1_560_000;
