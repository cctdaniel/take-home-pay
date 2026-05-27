import type { NordicTaxConfig } from "../../nordic-shared";

export const DK_TAX_YEAR = 2026;
export const DK_SOURCE_URLS = {
  skmPersonTaxAct: "https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven",
  skmMunicipalAverage: "https://skm.dk/tal-og-metode/satser/statistik-i-kommunerne/kommuneskatter-gennemsnitsprocenten-i-2026",
  skmTaxCalculationRules: "https://skm.dk/media/Skatteministeriet/Dokumenter/PDF%27er/skatteberegningsreglerne_2.pdf",
  skatEmploymentDeduction: "https://skat.dk/borger/fradrag/arbejdsrelaterede-fradrag/beskaeftigelses-og-jobfradrag",
  skatPensionDeduction: "https://skat.dk/borger/pension-og-efterloen/fradrag-for-indbetalinger-til-pension",
  skatExtraPensionDeduction: "https://skat.dk/borger/fradrag/ekstra-pensionsfradrag",
  skatUnionAndAkaase: "https://skat.dk/borger/unge-og-studerende/a-kasse/a-kasse-eller-fagforening",
  skatCommutingSupplement: "https://skat.dk/media/1olak5yc/04069_en_februar2026-t.pdf",
  skatHouseholdServices: "https://skat.dk/en-us/individuals/deductions-and-allowances/home-improvement-and-household-services/household-services?oid=2292305",
  skatWorkExpenses: "https://skat.dk/en-us/individuals/deductions-and-allowances/deductions-and-allowances-when-working/deductions-for-workwear-courses-etc",
  skatResearcherScheme: "https://skat.dk/en-us/businesses/employees-and-pay/non-danish-labour/tax-scheme-for-researchers",
  skatPersonnelBenefits:
    "https://skat.dk/borger/personalegoder-hvis-du-er-medarbejder/fri-telefon-computer-og-internet",
} as const;

export const DK_RESEARCHER_SCHEME_TAX_RATE = 0.3284;
export const DK_RESEARCHER_SCHEME_AM_RATE = 0.08;
export const DK_RESEARCHER_SCHEME_MIN_MONTHLY_SALARY = 65_400;

// Official 2026 personal tax parameters from Skatteministeriet/Skattestyrelsen.
export const DK_PERSONAL_ALLOWANCE_2026 = 54_100;
export const DK_AM_BIDRAG_RATE_2026 = 0.08;
export const DK_AVERAGE_MUNICIPAL_TAX_RATE_2026 = 0.25049;
export const DK_BOTTOM_TAX_RATE_2026 = 0.1201;
export const DK_MIDDLE_TAX_RATE_2026 = 0.075;
export const DK_TOP_TAX_RATE_2026 = 0.075;
export const DK_TOP_TOP_TAX_RATE_2026 = 0.05;
export const DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026 = 641_200;
export const DK_TOP_TAX_THRESHOLD_AFTER_AM_2026 = 777_900;
export const DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026 = 2_592_700;

export const DK_EMPLOYMENT_ALLOWANCE_2026 = {
  rate: 0.1275,
  max: 63_300,
};

export const DK_JOB_ALLOWANCE_2026 = {
  rate: 0.045,
  threshold: 235_200,
  max: 3_100,
};

export const DK_SINGLE_PARENT_EMPLOYMENT_ALLOWANCE_2026 = {
  rate: 0.115,
  max: 50_600,
};

export const DK_SENIOR_EMPLOYMENT_ALLOWANCE_2026 = {
  rate: 0.014,
  max: 6_100,
};

export const DK_RATE_PENSION_DEDUCTION_LIMIT_2026 = 68_700;
export const DK_EXTRA_PENSION_DEDUCTION_2026 = {
  basisCap: 87_800,
  moreThan15YearsRate: 0.12,
  within15YearsRate: 0.32,
};

export const DK_TRADE_UNION_FEE_LIMIT_2026 = 7_000;
export const DK_HOUSEHOLD_SERVICES_LIMIT_2026 = 18_300;
export const DK_OTHER_WORK_EXPENSE_THRESHOLD_2026 = 7_600;
export const DK_COMMUTING_DEDUCTION_2026 = {
  freeRoundTripKm: 24,
  firstBandMaxRoundTripKm: 120,
  firstBandRatePerKm: 2.28,
  excessBandRatePerKm: 1.14,
};

export const DK_TAX_CONFIG: NordicTaxConfig = {
  code: "DK",
  currency: "DKK",
  taxYear: DK_TAX_YEAR,
  defaultSalary: 600_000,
  // Retained for Nordic shared compatibility. DK calculator now applies allowances by tax base.
  standardDeduction: DK_PERSONAL_ALLOWANCE_2026,
  employeeSocialRate: DK_AM_BIDRAG_RATE_2026,
  employeeSocialName: "Labour market contribution (AM-bidrag)",
  deductEmployeeSocialBeforeIncomeTax: true,
  // Approximate combined ordinary wage rates using average municipal tax plus 2026 state layers.
  brackets: [
    { min: 0, max: DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, rate: DK_AVERAGE_MUNICIPAL_TAX_RATE_2026 + DK_BOTTOM_TAX_RATE_2026 },
    { min: DK_MIDDLE_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, max: DK_TOP_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, rate: DK_AVERAGE_MUNICIPAL_TAX_RATE_2026 + DK_BOTTOM_TAX_RATE_2026 + DK_MIDDLE_TAX_RATE_2026 },
    { min: DK_TOP_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, max: DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, rate: DK_AVERAGE_MUNICIPAL_TAX_RATE_2026 + DK_BOTTOM_TAX_RATE_2026 + DK_MIDDLE_TAX_RATE_2026 + DK_TOP_TAX_RATE_2026 },
    { min: DK_TOP_TOP_TAX_THRESHOLD_AFTER_AM_2026 - DK_PERSONAL_ALLOWANCE_2026, max: Infinity, rate: DK_AVERAGE_MUNICIPAL_TAX_RATE_2026 + DK_BOTTOM_TAX_RATE_2026 + DK_MIDDLE_TAX_RATE_2026 + DK_TOP_TAX_RATE_2026 + DK_TOP_TOP_TAX_RATE_2026 },
  ],
  assumptions: [
    "Models ordinary Danish employment salary for an adult resident using the 2026 personal allowance, 8% AM-bidrag, average municipal tax rate, no church tax, and the 2026 state bottom/middle/top/top-top rates.",
    "Taxable personnel benefits in kind can be entered as annual A-income values; they increase the modeled AM-bidrag and income-tax bases but are not treated as cash salary.",
    "Automatically applies the employment allowance and job allowance. Optional inputs model rate pension, extra pension deduction, union/A-kasse, commuting, household services, and qualifying employee work expenses.",
    "The researcher/highly paid employee scheme is modeled as 32.84% gross taxation with no ordinary deductions or allowances when selected.",
    "ATP, holiday-pay timing, church tax, exact municipality selection, capital/interest income, personnel-benefit valuation worksheets, and treaty positions require taxpayer-specific filing facts, so they are exposed only when a specific calculator input can model the rule accurately.",
  ],
  sourceUrls: [
    DK_SOURCE_URLS.skmPersonTaxAct,
    DK_SOURCE_URLS.skmMunicipalAverage,
    DK_SOURCE_URLS.skmTaxCalculationRules,
    DK_SOURCE_URLS.skatEmploymentDeduction,
    DK_SOURCE_URLS.skatPensionDeduction,
    DK_SOURCE_URLS.skatExtraPensionDeduction,
    DK_SOURCE_URLS.skatUnionAndAkaase,
    DK_SOURCE_URLS.skatCommutingSupplement,
    DK_SOURCE_URLS.skatHouseholdServices,
    DK_SOURCE_URLS.skatWorkExpenses,
    DK_SOURCE_URLS.skatResearcherScheme,
    DK_SOURCE_URLS.skatPersonnelBenefits,
  ],
};
