import type { NordicTaxConfig } from "../../nordic-shared";

export const DK_TAX_YEAR = 2026;
export const DK_SOURCE_URLS = {
  pwcDevelopments: "https://taxsummaries.pwc.com/denmark/individual/significant-developments",
  pwcCredits: "https://taxsummaries.pwc.com/denmark/individual/other-tax-credits-and-incentives",
  skmTaxCalculationRules: "https://skm.dk/media/Skatteministeriet/Dokumenter/PDF%27er/skatteberegningsreglerne_2.pdf",
  skatEmploymentDeduction: "https://skat.dk/borger/fradrag/arbejdsrelaterede-fradrag/beskaeftigelses-og-jobfradrag",
} as const;

export const DK_TAX_CONFIG: NordicTaxConfig = {
  code: "DK",
  currency: "DKK",
  taxYear: DK_TAX_YEAR,
  defaultSalary: 600_000,
  // Salary model: 8% AM-bidrag on gross plus average municipal/church-free state tax on income after AM and personal allowance.
  standardDeduction: 54_100,
  employeeSocialRate: 0.08,
  employeeSocialName: "Labour market contribution (AM-bidrag)",
  deductEmployeeSocialBeforeIncomeTax: true,
  // Approximate combined ordinary wage rates using average municipal tax (25.068%) plus 2026 state layers.
  brackets: [
    { min: 0, max: 696_956 * 0.92 - 54_100, rate: 0.25068 + 0.1201 },
    { min: 696_956 * 0.92 - 54_100, max: 845_543 * 0.92 - 54_100, rate: 0.25068 + 0.1201 + 0.075 },
    { min: 845_543 * 0.92 - 54_100, max: 2_818_152 * 0.92 - 54_100, rate: 0.25068 + 0.1201 + 0.075 + 0.075 },
    { min: 2_818_152 * 0.92 - 54_100, max: Infinity, rate: 0.25068 + 0.1201 + 0.075 + 0.075 + 0.05 },
  ],
  assumptions: [
    "Models ordinary Danish employment salary for an adult resident, no church tax, average municipal rate, and no private pension or commuting deductions.",
    "Applies the 2026 DKK 54,100 personal allowance and the 8% labour market contribution before state/municipal income tax in the calculator.",
    "ATP, holiday-pay timing, researcher taxation, deductions for interest/travel/union dues, and municipality-specific rates are outside this simplified model.",
  ],
  sourceUrls: [
    DK_SOURCE_URLS.pwcDevelopments,
    DK_SOURCE_URLS.pwcCredits,
    DK_SOURCE_URLS.skmTaxCalculationRules,
    DK_SOURCE_URLS.skatEmploymentDeduction,
  ],
};
