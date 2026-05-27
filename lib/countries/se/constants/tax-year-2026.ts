import type { NordicTaxConfig } from "../../nordic-shared";

export const SE_TAX_YEAR = 2026;
export const SE_SOURCE_URLS = {
  skatteverketStateTax: "https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/inkomstavtjanst/privattjansteinkomsterfaq/narskamanbetalastatliginkomstskattochhurhogarden.5.10010ec103545f243e8000166.html",
  skatteverketAmounts: "https://www.skatteverket.se/privat/skatter/beloppochprocent/2026/beloppochprocent2026kortversion.4.1522bf3f19aea8075ba89.html",
  skatteverketCommonDeductions: "https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/individualsandemployees/declaringtaxesforindividuals/commondeductionsinthetaxreturn.4.7be5268414bea064694c75e.html",
  skatteverketPensionDeduction: "https://www.skatteverket.se/privat/skatter/arbeteochinkomst/avdragforprivatpersoner/np.4.5fc8c94513259a4ba1d800042822.html",
  skatteverketRotRut: "https://skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/rotochrutavdragideklarationen.4.15532c7b1442f256baeae3e.html",
  skatteverketGreenTechnology: "https://skatteverket.se/privat/fastigheterochbostad/gronteknik",
  oecdSweden: "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/sweden_858c2098.html",
  researcherTaxRelief: "https://forskarskattenamnden.se/andra-sprak/taxation-of-research-workers-board/about-tax-relief",
  researcherRemunerationRate: "https://www.forskarskattenamnden.se/andra-sprak/taxation-of-research-workers-board/conditions-for-tax-relief/remuneration-rate",
} as const;

export const SE_GENERAL_PENSION_CONTRIBUTION_MAX = 47_100;
export const SE_AVERAGE_MUNICIPAL_TAX_RATE_2026 = 0.3241;
export const SE_EXPERT_RELIEF_EXEMPT_RATE = 0.25;
export const SE_EXPERT_RELIEF_TAXABLE_RATE = 0.75;
export const SE_EXPERT_RELIEF_2026_MIN_MONTHLY = 88_801;
export const SE_PRIVATE_PENSION_DEDUCTION_2026 = {
  rate: 0.35,
  max: 592_000,
};
export const SE_COMMUTING_DEDUCTION_THRESHOLD_2026 = 15_000;
export const SE_OTHER_WORK_EXPENSE_THRESHOLD_2026 = 5_000;
export const SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026 = 75_000;
export const SE_ROT_TAX_REDUCTION_SUB_LIMIT_2026 = 50_000;
export const SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026 = 50_000;

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
  flatTaxRate: SE_AVERAGE_MUNICIPAL_TAX_RATE_2026,
  brackets: [
    { min: 0, max: 643_000, rate: 0 },
    { min: 643_000, max: Infinity, rate: 0.20 },
  ],
  assumptions: [
    "Models Swedish employment income using the selected municipal tax rate, the 2026 state income tax threshold, and the general pension contribution capped at SEK 47,100 with a matching tax reduction.",
    "Uses the under-66 breakpoint difference as a simplified basic allowance proxy; actual Swedish basic allowance and job tax credit vary by income and age.",
    "Expert tax relief is modeled when selected by taxing 75% of salary under the ordinary model and exempting 25% from income tax and social-security bases.",
    "Ordinary mode includes explicit inputs for private pension savings when the employee lacks occupational pension rights, commuting expenses, other work expenses, ROT/RUT tax reduction, and green-technology tax reduction.",
    "Church/burial fees, exact grundavdrag/job tax credit formulas, exact tax-table withholding, and employer occupational pension plan design require municipality, payroll-table, or plan facts before they can be modeled accurately.",
  ],
  sourceUrls: [
    SE_SOURCE_URLS.skatteverketStateTax,
    SE_SOURCE_URLS.skatteverketAmounts,
    SE_SOURCE_URLS.skatteverketCommonDeductions,
    SE_SOURCE_URLS.skatteverketPensionDeduction,
    SE_SOURCE_URLS.skatteverketRotRut,
    SE_SOURCE_URLS.skatteverketGreenTechnology,
    SE_SOURCE_URLS.oecdSweden,
    SE_SOURCE_URLS.researcherTaxRelief,
    SE_SOURCE_URLS.researcherRemunerationRate,
  ],
};
