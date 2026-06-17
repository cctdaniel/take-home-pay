// Bulgaria 2026 salary tax parameters
// Source: https://www.mi.government.bg/en/general/danaci-i-socialni-osigurovki-svarzani-sas-slujitelite/

export const BG_TAX_YEAR = 2026;

export const BG_SOURCE_URLS = {
  taxesAndSocial:
    "https://www.mi.government.bg/en/general/danaci-i-socialni-osigurovki-svarzani-sas-slujitelite/",
  nra: "https://nra.bg/",
} as const;

/** Flat personal income tax rate on taxable employment income. */
export const BG_PIT_RATE = 0.1;

/** Employee social security — 13.78% on capped monthly assessment base. */
export const BG_SOCIAL_EMPLOYEE_RATE = 0.1378;
export const BG_SOCIAL_MONTHLY_CAP = 2_111.64;
export const BG_SOCIAL_ANNUAL_CAP = BG_SOCIAL_MONTHLY_CAP * 12;

/** Voluntary supplementary pension — deductible up to 10% of annual tax base (Art. 19 ZDDFL). */
// Source: https://nra.bg/wps/portal/nra/taxes/godishen-danak-varhu-dohdite/danachni-oblekcheniya/danachni-oblekcheniq
export const BG_VOLUNTARY_PENSION_MAX_TAX_BASE_RATE = 0.1;
