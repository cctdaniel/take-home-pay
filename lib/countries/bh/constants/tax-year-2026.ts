// Bahrain salary tax parameters — 2026
// Sources: https://www.nbr.gov.bh/ | https://www.sio.gov.bh/

export const BH_TAX_YEAR = 2026;

export const BH_SOURCE_URLS = {
  taxation: "https://www.nbr.gov.bh/",
  socialInsurance: "https://www.sio.gov.bh/",
} as const;

export const BH_PERSONAL_INCOME_TAX_RATE = 0;

/** Maximum insurable monthly wage for SIO (BHD). */
export const BH_SOCIAL_MONTHLY_CAP = 4_000;

export const BH_SOCIAL_ANNUAL_CAP = BH_SOCIAL_MONTHLY_CAP * 12;

/** Bahraini national employee social insurance rate on capped base. */
export const BH_NATIONAL_SOCIAL_EMPLOYEE_RATE = 0.08;

/** Expatriate unemployment insurance rate on capped base. */
export const BH_EXPAT_UNEMPLOYMENT_RATE = 0.01;

export const BH_NATIONALITY_OPTIONS = [
  { value: "bahraini_national", label: "Bahraini national" },
  { value: "expatriate", label: "Expatriate / non-Bahraini" },
] as const;
