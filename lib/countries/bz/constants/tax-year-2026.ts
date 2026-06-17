// Belize salary tax parameters — 2026
// Sources: https://www.socialsecurity.org.bz/ | https://www.belize.gov.bz/

export const BZ_TAX_YEAR = 2026;

export const BZ_SOURCE_URLS = {
  socialSecurity: "https://www.socialsecurity.org.bz/",
  incomeTax: "https://www.belize.gov.bz/",
} as const;

/** Employee social security contribution rate on insurable earnings. */
export const BZ_SOCIAL_EMPLOYEE_RATE = 0.045;

/** Weekly insurable earnings ceiling (BZD). */
export const BZ_SOCIAL_WEEKLY_CEILING = 520;

export const BZ_SOCIAL_ANNUAL_CEILING = BZ_SOCIAL_WEEKLY_CEILING * 52;

/** Maximum annual employee social contribution (BZD). */
export const BZ_SOCIAL_EMPLOYEE_ANNUAL_MAX = 1_217;

/** Annual income tax exemption (BZD). */
export const BZ_PIT_EXEMPTION_2026 = 29_000;

/** Flat PIT rate on income above exemption. */
export const BZ_PIT_RATE = 0.25;
