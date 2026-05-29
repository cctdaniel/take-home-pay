// Latvia 2026 salary tax parameters
// Sources: https://www.vid.gov.lv/ , https://www.ssia.gov.lv/

import type { TaxBracket } from "../../types";

export const LV_TAX_YEAR = 2026;

export const LV_SOURCE_URLS = {
  personalIncomeTax: "https://www.vid.gov.lv/en/personal-income-tax",
  socialInsurance:
    "https://www.ssia.gov.lv/en/social-insurance-contributions",
} as const;

/** Employee social security — 10.5% on capped assessment base. */
export const LV_SS_EMPLOYEE_RATE = 0.105;
export const LV_SS_ANNUAL_CAP = 105_300;

/** Non-taxable minimum (NTA) — EUR 550/month annualized. */
export const LV_NTA_MONTHLY = 550;
export const LV_NTA_ANNUAL = LV_NTA_MONTHLY * 12;

export const LV_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 105_300, rate: 0.255 },
  { min: 105_300, max: Infinity, rate: 0.33 },
];
