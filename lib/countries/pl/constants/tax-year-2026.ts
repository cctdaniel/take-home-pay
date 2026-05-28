// Poland 2026 salary tax parameters (PIT scale + ZUS)
// Sources: https://www.gov.pl/ | https://www.zus.pl/

export const PL_TAX_YEAR = 2026;

export const PL_SOURCE_URLS = {
  pit: "https://www.gov.pl/web/finanse",
  zus: "https://www.zus.pl/",
  health: "https://www.gov.pl/web/zdrowie",
} as const;

export const PL_PIT_LOWER_RATE = 0.12;
export const PL_PIT_HIGHER_RATE = 0.32;
export const PL_TAX_FREE_AMOUNT = 30_000;
export const PL_TAX_FREE_CREDIT = PL_TAX_FREE_AMOUNT * PL_PIT_LOWER_RATE;
export const PL_FIRST_BRACKET_LIMIT = 120_000;
export const PL_ZUS_EMPLOYEE_RATE = 0.1371;
export const PL_HEALTH_INSURANCE_RATE = 0.09;
export const PL_CHILD_TAX_CREDIT_ANNUAL = 1_112.4;

/** IKZE individual retirement account — annual deposit cap 2026 (Ministry of Finance). */
export const PL_IKZE_ANNUAL_CAP_2026 = 10_512;

/** PPK additional employee contribution — up to 4% of gross; reduces PIT base. */
export const PL_PPK_ADDITIONAL_MAX_RATE = 0.04;
