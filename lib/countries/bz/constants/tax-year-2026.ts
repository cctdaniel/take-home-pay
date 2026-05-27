import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BZCalculatorInputs } from "../types";

export const BZ_TAX_YEAR = 2026;

export const BZ_PERSONAL_RELIEF = 20000;
export const BZ_LOW_INCOME_EXEMPTION_LIMIT = 29000;
export const BZ_TAX_CREDIT_NET_FLOOR = 29000;
export const BZ_TAX_CREDIT_UPPER_LIMIT = 32000;
export const BZ_INCOME_TAX_RATE = 0.25;
export const BZ_CHARITABLE_RELIEF_RATE = 1 / 6;
export const BZ_CHARITABLE_RELIEF_MINIMUM = 250;
export const BZ_EDUCATION_RELIEF_PER_CHILD = 400;
export const BZ_EDUCATION_RELIEF_CHILD_LIMIT = 4;
export const BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY_EARNINGS_THRESHOLD = 500;
export const BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY = 23.4;
export const BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_ANNUAL =
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY * 52;
export const BZ_SSB_RETIRED_PERSON_EMPLOYER_WEEKLY = 2.6;

export const BZ_SOURCE_URLS = [
  "https://bts.gov.bz/income-tax-calculator/",
  "https://bts.gov.bz/file-income-tax/",
  "https://bts.gov.bz/wp-content/uploads/2020/06/GUIDE-TO-THE-COMPLETION-OF-EMPLOYEE-INCOME-TAX-RETURN.pdf",
  "https://socialsecurity.org.bz/contributions/",
  "https://socialsecurity.org.bz/wp-content/uploads/2022/03/Cont_Ben_Schedule.jpg",
  "https://taxsummaries.pwc.com/belize/individual/taxes-on-personal-income",
] as const;

const BZ_SSB_EMPLOYEE_WEEKLY_CONTRIBUTIONS = [
  { min: 0, max: 70, amount: 1.03 },
  { min: 70, max: 110, amount: 1.69 },
  { min: 110, max: 140, amount: 2.44 },
  { min: 140, max: 180, amount: 3.94 },
  { min: 180, max: 220, amount: 5.94 },
  { min: 220, max: 260, amount: 7.94 },
  { min: 260, max: 300, amount: 9.94 },
  { min: 300, max: 340, amount: 11.94 },
  { min: 340, max: 380, amount: 13.98 },
  { min: 380, max: 420, amount: 16.15 },
  { min: 420, max: 460, amount: 18.45 },
  { min: 460, max: 500, amount: 20.86 },
  { min: 500, max: Infinity, amount: BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY },
] as const;

function asBZInputs(inputs?: unknown): Partial<BZCalculatorInputs> {
  return (inputs ?? {}) as Partial<BZCalculatorInputs>;
}

function isEmployeeSsbDeducted(inputs?: unknown): boolean {
  return asBZInputs(inputs).socialSecurityStatus === undefined ||
    asBZInputs(inputs).socialSecurityStatus === "standard";
}

export function calculateBelizePersonalRelief(grossSalary: number): number {
  return grossSalary <= BZ_LOW_INCOME_EXEMPTION_LIMIT
    ? grossSalary
    : BZ_PERSONAL_RELIEF;
}

export function getBelizeSsbWeeklyInsurableEarnings({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const enteredWeeklyEarnings =
    asBZInputs(inputs).ssbWeeklyInsurableEarnings ?? 0;
  const weeklySalary = Math.max(0, grossSalary / 52);

  return Math.min(
    enteredWeeklyEarnings > 0 ? Math.max(0, enteredWeeklyEarnings) : weeklySalary,
    weeklySalary,
  );
}

export function calculateBelizeSsbEmployeeWeeklyContribution(
  weeklyInsurableEarnings: number,
): number {
  const weeklySalary = Math.max(0, weeklyInsurableEarnings);
  if (weeklySalary <= 0) {
    return 0;
  }

  const weeklyContribution =
    BZ_SSB_EMPLOYEE_WEEKLY_CONTRIBUTIONS.find(
      (band) => weeklySalary >= band.min && weeklySalary < band.max,
    )?.amount ?? BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY;

  return weeklyContribution;
}

export function calculateBelizeSsbEmployeeContribution({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return (
    calculateBelizeSsbEmployeeWeeklyContribution(
      getBelizeSsbWeeklyInsurableEarnings({ grossSalary, inputs }),
    ) * 52
  );
}

export function calculateBelizeSsbEmployerOnlyContributionAnnual(
  inputs?: unknown,
): number {
  return isEmployeeSsbDeducted(inputs)
    ? 0
    : BZ_SSB_RETIRED_PERSON_EMPLOYER_WEEKLY * 52;
}

function calculateCharitableReliefLimit({
  grossSalary,
}: {
  grossSalary: number;
}) {
  const chargeableIncomeBeforeCharity = Math.max(
    0,
    grossSalary - calculateBelizePersonalRelief(grossSalary),
  );

  return chargeableIncomeBeforeCharity * BZ_CHARITABLE_RELIEF_RATE;
}

function calculateEducationReliefLimit({
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const eligibleChildren = Math.min(
    Math.max(0, Math.trunc(asBZInputs(inputs).educationReliefChildren ?? 0)),
    BZ_EDUCATION_RELIEF_CHILD_LIMIT,
  );

  return eligibleChildren * BZ_EDUCATION_RELIEF_PER_CHILD;
}

export const BZ_TAX_CONFIG = {
  code: "BZ",
  currency: "BZD",
  taxYear: BZ_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Income tax",
  resolvePersonalAllowance: ({ grossSalary }) =>
    calculateBelizePersonalRelief(grossSalary),
  deductions: [],
  taxCredits: [
    {
      name: "BZD 29,000 net salary floor credit",
      calculate: ({ grossSalary, grossIncomeTax }) =>
        grossSalary > BZ_LOW_INCOME_EXEMPTION_LIMIT &&
        grossSalary <= BZ_TAX_CREDIT_UPPER_LIMIT
          ? Math.max(0, grossIncomeTax - (grossSalary - BZ_TAX_CREDIT_NET_FLOOR))
          : 0,
    },
  ],
  brackets: [{ min: 0, max: Infinity, rate: BZ_INCOME_TAX_RATE }],
  resolveSocialContributions: ({ grossSalary, inputs }) =>
    isEmployeeSsbDeducted(inputs)
      ? [
          {
            name: "Social Security employee contribution",
            calculateAmount: () =>
              calculateBelizeSsbEmployeeContribution({
                grossSalary,
                inputs,
              }),
            preTax: false,
          },
        ]
      : [],
  voluntaryContributions: [
    {
      key: "charitableDonations",
      name: "Charitable relief",
      calculateLimit: calculateCharitableReliefLimit,
      description:
        "Charitable relief for qualifying cultural, religious, charitable, town/village improvement, or education donations. BTS requires at least BZD 250 and caps the deduction at one-sixth of chargeable income.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Education relief",
      calculateLimit: calculateEducationReliefLimit,
      description:
        "Education relief for children who are not yours, do not live with you, and attend school full-time, capped at BZD 400 per child and four children.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Belize employment income is modeled with the Belize Tax Service tax-year-2025 personal relief amendments: no employee income tax at BZD 29,000 or less, BZD 20,000 relief above that, and the BZD 29,000 net salary floor credit for BZD 29,000.01 to BZD 32,000.",
    "Employee income tax is 25% of chargeable income after personal relief and modeled charitable or education relief.",
    "Social Security uses the official weekly employee contribution schedule effective April 4, 2022, including the BZD 23.40 maximum employee weekly contribution at BZD 500+ weekly earnings.",
    "Employees age 60 to 64 receiving a Social Security retirement benefit, and employees age 65 or older, are modeled with no employee Social Security deduction.",
    "Charitable relief is modeled as an optional deduction only when the entered amount is at least BZD 250, capped at one-sixth of chargeable income.",
    "Education relief is modeled separately at BZD 400 per eligible non-dependent child, with up to four children and excess contributions excluded from the current-year salary result.",
  ],
  modeledExclusions: [
    "Belize Social Security voluntary contributions are not shown because they apply when a person is no longer in insurable employment, not as an ordinary salaried-employee payroll top-up.",
    "Business tax, self-employed Social Security, exact TD4/payroll timing, education-relief carry-forwards, and employer-only Social Security contributions beyond the shown retired-person context require business, payroll-period, prior-year, or employer facts before they can be shown as salary controls.",
  ],
  sourceUrls: [...BZ_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BZ">;
