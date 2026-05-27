import type { IETaxStatus } from "../types";

export const IE_TAX_YEAR = 2026;

export const IE_SOURCE_URLS = {
  taxRates:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx",
  employeeTaxCredit:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx",
  usc: "https://www.revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds.aspx",
  reducedUsc:
    "https://www.revenue.ie/en/jobs-and-pensions/usc/reduced-rates.aspx",
  pensionRelief:
    "https://www.revenue.ie/en/jobs-and-pensions/pension/relief/tax-relief-limits.aspx",
  prsiClassA:
    "https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates/",
  benefitsInKind:
    "https://www.revenue.ie/en/jobs-and-pensions/taxation-of-employer-benefits/how-employer-benefits-are-taxed.aspx",
  myFutureFund:
    "https://www.gov.ie/en/department-of-social-protection/publications/myfuturefund-contribution-examples-for-employees/",
  healthExpenses:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/health-and-age/health-expenses/index.aspx",
  flatRateExpenses:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/flat-rate-expenses/index.aspx",
  homeCarer:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/health-and-age/home-carer-credit/home-carer-tax-credit-rates.aspx",
  sarp:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/special-assignee-relief-programme/how-do-you-calculate-how-much-relief-is-due.aspx",
} as const;

export const IE_PENSION_EARNINGS_CAP = 115_000;

export const IE_TAX_CREDITS_2026 = {
  singlePerson: 2_000,
  marriedPerson: 4_000,
  employeePaye: 2_000,
  singlePersonChildCarer: 1_900,
  homeCarer: 1_950,
  homeCarerFullCreditIncomeLimit: 7_200,
  homeCarerNoCreditIncomeLimit: 11_100,
  dependentRelative: 305,
  rentSingle: 1_000,
  rentJoint: 2_000,
  rentCreditRate: 0.2,
  healthExpenseRate: 0.2,
} as const;

export const IE_STANDARD_RATE_BANDS_2026: Record<IETaxStatus, number> = {
  single: 44_000,
  married_one_income: 53_000,
  married_two_incomes: 88_000,
};

export const IE_SINGLE_PERSON_CHILD_CARER_BAND = 48_000;

export const IE_USC_EXEMPTION_LIMIT = 13_000;
export const IE_USC_STANDARD_BANDS_2026 = [
  { min: 0, max: 12_012, rate: 0.005 },
  { min: 12_012, max: 28_700, rate: 0.02 },
  { min: 28_700, max: 70_044, rate: 0.03 },
  { min: 70_044, max: Infinity, rate: 0.08 },
] as const;

export const IE_USC_REDUCED_INCOME_LIMIT = 60_000;
export const IE_USC_REDUCED_BANDS_2026 = [
  { min: 0, max: 12_012, rate: 0.005 },
  { min: 12_012, max: Infinity, rate: 0.02 },
] as const;

export const IE_PRSI_CLASS_A_2026 = {
  weeklyNoEmployeePrsiLimit: 352,
  weeklyCreditUpperLimit: 424,
  weeklyCredit: 12,
  preOctoberWeeks: 39,
  postOctoberWeeks: 13,
  preOctoberEmployeeRate: 0.042,
  postOctoberEmployeeRate: 0.0435,
} as const;

export const IE_MY_FUTURE_FUND_2026 = {
  employeeRate: 0.015,
  employerRate: 0.015,
  stateRate: 0.005,
  earningsCap: 80_000,
  automaticEnrolmentMinimumAge: 23,
  automaticEnrolmentMaximumAge: 60,
  automaticEnrolmentIncomeThreshold: 20_000,
} as const;

export const IE_SARP_2026 = {
  reliefRate: 0.3,
  upperIncomeLimit: 1_000_000,
  maxYears: 5,
  thresholds: {
    arrived_2023_to_2025: 100_000,
    arrived_2026_onwards: 125_000,
  },
} as const;

export function getIEPensionReliefPercent(age: number): number {
  if (age < 30) return 0.15;
  if (age < 40) return 0.2;
  if (age < 50) return 0.25;
  if (age < 55) return 0.3;
  if (age < 60) return 0.35;
  return 0.4;
}

export function getIEPensionReliefLimit(grossSalary: number, age: number) {
  return Math.max(
    0,
    Math.min(grossSalary, IE_PENSION_EARNINGS_CAP) *
      getIEPensionReliefPercent(age),
  );
}

export function getIERentTaxCreditCap(taxStatus: IETaxStatus) {
  return taxStatus === "single"
    ? IE_TAX_CREDITS_2026.rentSingle
    : IE_TAX_CREDITS_2026.rentJoint;
}

export function getIEQualifyingRentPaidLimit(taxStatus: IETaxStatus) {
  return getIERentTaxCreditCap(taxStatus) / IE_TAX_CREDITS_2026.rentCreditRate;
}

export const IE_TAX_CONFIG = {
  code: "IE",
  currency: "EUR",
  taxYear: IE_TAX_YEAR,
  defaultSalary: 55_000,
  defaultAge: 35,
  standardDeduction: 0,
  taxStatuses: {
    single: {
      name: "Single employee",
      standardRateBand: IE_STANDARD_RATE_BANDS_2026.single,
      personalTaxCredit: IE_TAX_CREDITS_2026.singlePerson,
      employeeTaxCreditCount: 1,
    },
    married_one_income: {
      name: "Married/civil partners, one income",
      standardRateBand: IE_STANDARD_RATE_BANDS_2026.married_one_income,
      personalTaxCredit: IE_TAX_CREDITS_2026.marriedPerson,
      employeeTaxCreditCount: 1,
    },
    married_two_incomes: {
      name: "Married/civil partners, two incomes",
      standardRateBand: IE_STANDARD_RATE_BANDS_2026.married_two_incomes,
      personalTaxCredit: IE_TAX_CREDITS_2026.marriedPerson,
      employeeTaxCreditCount: 2,
    },
  },
  assumptions: [
    "Models a full-year Irish PAYE employee with selectable single or married/civil-partner standard-rate bands and 2026 Revenue tax credits.",
    "Employee PRSI is modeled with 2026 Class A weekly thresholds, the tapered employee PRSI credit, and the 1 October 2026 rate increase.",
    "Universal Social Charge uses the 2026 standard bands, the €13,000 annual exemption, and the reduced USC rates when selected and income does not exceed €60,000.",
    "Private pension and AVC/PRSA-style contributions use Revenue's age-related percentage limits and the €115,000 earnings cap; they do not reduce PRSI or USC.",
    "SARP is modeled as a user-selected income-tax-only relief: 30% of qualifying employment income after modeled private pension relief above the selected Revenue threshold, capped at €1,000,000 of income. USC and PRSI remain based on full salary.",
    "Taxable benefit-in-kind cash-equivalent values can be entered; they increase the PAYE, PRSI, and USC bases but are not treated as cash salary paid to the employee.",
    "MyFutureFund is modeled as a post-tax employee payroll deduction with employer and State top-ups shown for context.",
    "Rent tax credit, health expense relief, Home Carer Tax Credit, Single Person Child Carer Credit, dependent relative credit, and Revenue-approved flat-rate expenses are modeled when entered.",
    "Local property tax, benefit-in-kind valuation worksheets, week-one payroll timing, emergency tax, mortgage interest credit, and nursing-home relief at the higher rate remain taxpayer-specific annual-return items.",
  ],
  sourceUrls: Object.values(IE_SOURCE_URLS),
};
