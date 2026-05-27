import type { NordicTaxConfig } from "../../nordic-shared";

export const FI_TAX_YEAR = 2026;
export const FI_SOURCE_URLS = {
  oecdTaxingWages: "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/finland_a35a14c3.html",
  veroTaxBases: "https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/tax_card/tax-rate-and-income-ceiling/tax-bases/",
  veroSocialInsurance: "https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/being-an-employer/social-insurance-contributions/",
  veroCommuting: "https://www.vero.fi/en/individuals/deductions/travel-expenses/commuting-expenses/",
  veroHouseholdCredit: "https://www.vero.fi/en/individuals/deductions/Tax-credit-for-household-expenses/tax-credit-amount/",
  veroCapitalDeductions: "https://www.vero.fi/en/individuals/deductions/what-can-I-deduct/deductions-from-capital-incom/",
  veroIncomeProductionExpenses: "https://www.vero.fi/en/individuals/deductions/expenses-for-the-production-of-income/what-kind-of-expenses-are-tax-deductible-expenses-for-production-of-income/",
  veroIncomeProductionFiling: "https://www.vero.fi/en/individuals/deductions/expenses-for-the-production-of-income/how-to-claim-expenses-for-the-production-of-income/",
  veroFringeBenefits: "https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/income/earned-income/fringe-benefits-from-employment/",
  veroFringeBenefitValues: "https://www.vero.fi/en/detailed-guidance/decisions/47380/in-kind-benefits-fringe-benefits-2026/",
  telaPensionContributions: "https://www.tela.fi/en/financing-of-pensions/pension-contributions/",
  veroKeyEmployees: "https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/arriving_in_finland/work_in_finland/specific-instructions-for-different-occupations/key_employees_from_other_countrie/",
} as const;

export const FI_KEY_EMPLOYEE_TAX_AT_SOURCE_RATE = 0.25;
export const FI_EMPLOYEE_PENSION_RATE_2026 = 0.073;
export const FI_EMPLOYEE_UNEMPLOYMENT_RATE_2026 = 0.0089;
export const FI_HEALTH_CARE_CONTRIBUTION_RATE_2026 = 0.011;
export const FI_DAILY_ALLOWANCE_CONTRIBUTION_RATE_2026 = 0.0088;
export const FI_DAILY_ALLOWANCE_THRESHOLD_2026 = 17_255;
export const FI_EMPLOYEE_SOCIAL_RATE_2026 =
  FI_EMPLOYEE_PENSION_RATE_2026 +
  FI_EMPLOYEE_UNEMPLOYMENT_RATE_2026 +
  FI_HEALTH_CARE_CONTRIBUTION_RATE_2026 +
  FI_DAILY_ALLOWANCE_CONTRIBUTION_RATE_2026;
export const FI_EMPLOYEE_SOCIAL_RATE_BELOW_DAILY_THRESHOLD_2026 =
  FI_EMPLOYEE_PENSION_RATE_2026 +
  FI_EMPLOYEE_UNEMPLOYMENT_RATE_2026 +
  FI_HEALTH_CARE_CONTRIBUTION_RATE_2026;

export const FI_COMMUTING_EXPENSE_DEDUCTION_2026 = {
  personalLiability: 900,
  maxDeduction: 7_000,
  modeledExpenseMax: 7_900,
};

export const FI_HOUSEHOLD_EXPENSE_CREDIT_2026 = {
  workExpenseRate: 0.35,
  creditThreshold: 150,
  maxCredit: 1_600,
  modeledWorkExpenseMax: 5_000,
};

export const FI_VOLUNTARY_PENSION_INSURANCE_2026 = {
  contributionLimit: 5_000,
  deficitCreditRate: 0.3,
};

export const FI_INCOME_PRODUCTION_EXPENSES_2026 = {
  automaticDeduction: 750,
};

export const FI_TAX_CONFIG: NordicTaxConfig = {
  code: "FI",
  currency: "EUR",
  taxYear: FI_TAX_YEAR,
  defaultSalary: 60_000,
  standardDeduction: 4_115,
  employeeSocialRate: FI_EMPLOYEE_SOCIAL_RATE_2026,
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
    "Uses the OECD-listed 2026 maximum basic allowance and earned income tax credit as simplified annual reductions, with Vero 2026 employee social contribution rates.",
    "The foreign key employee regime is modeled as 25% tax at source when selected, with employee pension and unemployment insurance still deducted unless foreign social-security coverage is outside the model; Vero states that health-care and daily-allowance contributions are not withheld from key-employee wages.",
    "Ordinary mode includes modeled commuting expense deduction, unemployment fund fees, other income-production expenses above the automatic EUR 750 deduction, household expense credit, and voluntary pension/PS savings deficit-credit treatment.",
    "Taxable fringe benefits entered in the calculator are treated as wages for income tax and employee social insurance, but they do not increase cash take-home pay.",
    "Church tax, exact municipality rates, YLE tax, family benefits, exact TyEL upper-age birth-year transitions, capital-income sufficiency ordering, and tax-card withholding rounding are not modeled.",
  ],
  sourceUrls: [
    FI_SOURCE_URLS.oecdTaxingWages,
    FI_SOURCE_URLS.veroTaxBases,
    FI_SOURCE_URLS.veroSocialInsurance,
    FI_SOURCE_URLS.veroCommuting,
    FI_SOURCE_URLS.veroHouseholdCredit,
    FI_SOURCE_URLS.veroCapitalDeductions,
    FI_SOURCE_URLS.veroIncomeProductionExpenses,
    FI_SOURCE_URLS.veroIncomeProductionFiling,
    FI_SOURCE_URLS.veroFringeBenefits,
    FI_SOURCE_URLS.veroFringeBenefitValues,
    FI_SOURCE_URLS.telaPensionContributions,
    FI_SOURCE_URLS.veroKeyEmployees,
  ],
};
