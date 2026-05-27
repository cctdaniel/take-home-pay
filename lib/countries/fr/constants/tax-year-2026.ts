import type { TaxBracket } from "../../types";

export const FR_TAX_YEAR = 2026;

export const FR_SOURCE_URLS = {
  incomeTaxBrochure:
    "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/21-calcul_impot_369a382.pdf",
  baremeIndexation:
    "https://bofip.impots.gouv.fr/bofip/14954-PGP.html/ACTU-2026-00022",
  professionalExpenses:
    "https://www.impots.gouv.fr/particulier/je-declare-mes-frais-professionnels",
  simulatorProfessionalExpenses:
    "https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm",
  retirementSavings: "https://www.impots.gouv.fr/particulier/epargne-retraite",
  impatriateRegime:
    "https://www.impots.gouv.fr/international-particulier/le-regime-des-impatries",
  impatriateRemuneration:
    "https://bofip.impots.gouv.fr/bofip/5677-PGP.html/identifiant%3DBOI-RSA-GEO-40-10-20-20250410",
  benefitsInKindIncomeTax:
    "https://www.service-public.gouv.fr/particuliers/vosdroits/F1226",
  benefitsInKindPayroll:
    "https://mon-entreprise.urssaf.fr/documentation/salari%C3%A9/r%C3%A9mun%C3%A9ration/avantages-en-nature?currentEngineId=999154546",
} as const;

export const FR_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 11_600, rate: 0 },
  { min: 11_600, max: 29_579, rate: 0.11 },
  { min: 29_579, max: 84_577, rate: 0.3 },
  { min: 84_577, max: 181_917, rate: 0.41 },
  { min: 181_917, max: Infinity, rate: 0.45 },
];

export const FR_EMPLOYMENT_EXPENSE_DEDUCTION_2026 = {
  rate: 0.1,
  min: 509,
  max: 14_555,
} as const;

export const FR_RETIREMENT_SAVINGS_DEDUCTION_2026 = {
  rate: 0.1,
  min: 4_710,
  max: 37_680,
} as const;

export const FR_FAMILY_QUOTIENT_CAP_2026 = {
  perHalfPart: 1_807,
  singleParentFirstChild: 4_262,
} as const;

export const FR_DECOTE_2026 = {
  singleThreshold: 1_982,
  jointThreshold: 3_277,
  singleAmount: 897,
  jointAmount: 1_483,
  rate: 0.4525,
} as const;

export const FR_LOW_TAX_COLLECTION_THRESHOLD = 61;

export const FR_GENERAL_DONATION_REDUCTION_2026 = {
  rate: 0.66,
  taxableIncomeLimitRate: 0.2,
} as const;

export const FR_IMPATRIATE_REGIME_2026 = {
  forfaitPremiumRate: 0.3,
  globalSalaryExemptionCapRate: 0.5,
  foreignWorkdayCapRate: 0.2,
} as const;

export function calculateFRStandardEmploymentDeduction(grossSalary: number) {
  if (grossSalary <= 0) {
    return 0;
  }

  return Math.min(
    grossSalary,
    Math.min(
      FR_EMPLOYMENT_EXPENSE_DEDUCTION_2026.max,
      Math.max(
        grossSalary * FR_EMPLOYMENT_EXPENSE_DEDUCTION_2026.rate,
        FR_EMPLOYMENT_EXPENSE_DEDUCTION_2026.min,
      ),
    ),
  );
}

export function calculateFRRetirementSavingsLimit(grossSalary: number) {
  if (grossSalary <= 0) {
    return 0;
  }

  return Math.min(
    grossSalary,
    Math.min(
      FR_RETIREMENT_SAVINGS_DEDUCTION_2026.max,
      Math.max(
        grossSalary * FR_RETIREMENT_SAVINGS_DEDUCTION_2026.rate,
        FR_RETIREMENT_SAVINGS_DEDUCTION_2026.min,
      ),
    ),
  );
}

export const FR_TAX_CONFIG = {
  code: "FR",
  currency: "EUR",
  taxYear: FR_TAX_YEAR,
  defaultSalary: 45_000,
  employeeSocialRate: 0.22,
  employeeSocialName: "Employee social contributions (approx.)",
  deductEmployeeSocialBeforeIncomeTax: false,
  brackets: FR_INCOME_TAX_BRACKETS_2026,
  assumptions: [
    "Models a full-year resident employee using the 2026 ordinary progressive income-tax scale for 2025 income.",
    "Calculates household parts from marital/PACS status, single-parent status, and dependent children, then applies the ordinary family-quotient cap for common employee households.",
    "Applies either the automatic 10% employment expense deduction or user-entered justified actual professional expenses. The automatic 10% deduction uses the 2025-income minimum and maximum from the official 2026 simulator help.",
    "PER-style retirement savings use the modeled 10% salary proxy with the official 2026 minimum and maximum deduction limits; unused prior-year ceiling carry-forward is not modeled.",
    "Taxable avantages en nature can be entered as annual non-cash benefit values; they increase the modeled income-tax and employee social-contribution bases but are deducted from cash net pay rather than treated as cash salary.",
    "General charitable donations are modeled at 66% within the 20% taxable-income limit and capped to tax due.",
    "The French impatriate salary regime is modeled when selected for the impatriation premium only: either the 30% forfaitary premium proxy or a user-entered actual premium, both capped by the 50% salary-exemption limit and the entered French reference-salary floor.",
    "Employee social contributions are approximated as a combined employee payroll contribution rate because exact French payslip rates depend on salary tranche, scheme, executive status, and complementary pension setup.",
    "Personalized withholding rates, detailed payroll-tranche social contribution mechanics, foreign-workday impatriate remuneration, impatriate passive-income/capital-gain rules, benefit-in-kind valuation worksheets, employer-only charges, special half-parts, and non-common reductions require taxpayer-specific payroll, household, or legal facts before they can be modeled accurately.",
  ],
  sourceUrls: Object.values(FR_SOURCE_URLS),
};
