import type { NordicTaxConfig } from "../../nordic-shared";

export const SE_TAX_YEAR = 2026;
export const SE_SOURCE_URLS = {
  skatteverketStateTax: "https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/inkomstavtjanst/privattjansteinkomsterfaq/narskamanbetalastatliginkomstskattochhurhogarden.5.10010ec103545f243e8000166.html",
  skatteverketAmounts: "https://www.skatteverket.se/privat/skatter/beloppochprocent/2026/beloppochprocent2026kortversion.4.1522bf3f19aea8075ba89.html",
  oecdSweden: "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/sweden_858c2098.html",
} as const;

export const SE_GENERAL_PENSION_CONTRIBUTION_MAX = 47_100;

export const SE_TAX_CONFIG: NordicTaxConfig = {
  code: "SE",
  currency: "SEK",
  taxYear: SE_TAX_YEAR,
  defaultSalary: 600_000,
  standardDeduction: 17_400,
  employeeSocialRate: 0.07,
  employeeSocialContributionCap: SE_GENERAL_PENSION_CONTRIBUTION_MAX,
  employeeSocialName: "General pension contribution",
  creditEmployeeSocialContribution: true,
  flatTaxRate: 0.3241,
  brackets: [
    { min: 0, max: 643_000, rate: 0 },
    { min: 643_000, max: Infinity, rate: 0.20 },
  ],
  assumptions: [
    "Models Swedish employment income using average municipal tax, the 2026 state income tax threshold, and the general pension contribution capped at SEK 47,100 with a matching tax reduction.",
    "Uses the under-66 breakpoint difference as a simplified basic allowance proxy; actual Swedish basic allowance and job tax credit vary by income and age.",
    "Municipality/region-specific tax, church/burial fees, exact grundavdrag/job tax credit formulas, and expert tax relief are outside scope.",
  ],
  sourceUrls: [SE_SOURCE_URLS.skatteverketStateTax, SE_SOURCE_URLS.skatteverketAmounts, SE_SOURCE_URLS.oecdSweden],
};

export const SE_IPS_MAX_INCOME_FOR_DEDUCTION_2026 = 581_100;
export const SE_IPS_DEDUCTION_RATE = 0.35;
