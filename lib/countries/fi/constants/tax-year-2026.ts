import type { NordicTaxConfig } from "../../nordic-shared";

export const FI_TAX_YEAR = 2026;
export const FI_SOURCE_URLS = {
  oecdTaxingWages: "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/finland_a35a14c3.html",
  telaPensionContributions: "https://www.tela.fi/en/financing-of-pensions/pension-contributions/",
} as const;

export const FI_TAX_CONFIG: NordicTaxConfig = {
  code: "FI",
  currency: "EUR",
  taxYear: FI_TAX_YEAR,
  defaultSalary: 60_000,
  standardDeduction: 4_115,
  employeeSocialRate: 0.0715 + 0.0059 + 0.0084,
  employeeSocialName: "Employee pension, unemployment, and daily allowance contributions",
  flatTaxRate: 0.0754,
  taxCredit: 3_225,
  brackets: [
    { min: 0, max: 21_200, rate: 0.1264 },
    { min: 21_200, max: 31_500, rate: 0.19 },
    { min: 31_500, max: 52_100, rate: 0.3025 },
    { min: 52_100, max: 88_200, rate: 0.34 },
    { min: 88_200, max: 150_000, rate: 0.4175 },
    { min: 150_000, max: Infinity, rate: 0.4425 },
  ],
  assumptions: [
    "Models Finnish resident employee salary using the 2026 central-government scale, an average municipal rate proxy, and selected wage-earner contributions.",
    "Uses the OECD-listed 2026 maximum basic allowance and earned income tax credit as simplified annual reductions.",
    "Church tax, YLE tax, age-53-to-62 pension surcharge, municipality-specific rates, travel expenses, household deductions, and family benefits are not modeled.",
  ],
  sourceUrls: [FI_SOURCE_URLS.oecdTaxingWages, FI_SOURCE_URLS.telaPensionContributions],
};
