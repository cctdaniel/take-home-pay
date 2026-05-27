import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BMCalculatorInputs } from "../types";

export const BM_TAX_YEAR = 2026;

export const BM_SOURCE_URLS = [
  "https://www.gov.bm/payroll-tax",
  "https://www.gov.bm/calculating-payroll-tax-2026",
  "https://pensioncommission.bm/employers-self-employed/",
  "https://healthcouncil.bm/programmes/",
  "https://www.gov.bm/articles/update-standard-premium-rate-upcoming-fiscal-year",
  "https://taxsummaries.pwc.com/bermuda/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/bermuda/individual/other-taxes",
] as const;

const WEEKS_PER_YEAR = 52;
export const BM_EMPLOYEE_SOCIAL_INSURANCE_WEEKLY = 37.65;
export const BM_OCCUPATIONAL_PENSION_EMPLOYEE_RATE = 0.05;
export const BM_STANDARD_PREMIUM_RATE_MONTHLY_2026 = 439.55;
export const BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL =
  BM_STANDARD_PREMIUM_RATE_MONTHLY_2026 * 12 * 0.5;

const BM_PAYROLL_TAX_BRACKETS = [
  { min: 0, max: 48000, rate: 0.0025 },
  { min: 48000, max: 96000, rate: 0.0775 },
  { min: 96000, max: 200000, rate: 0.1075 },
  { min: 200000, max: 500000, rate: 0.115 },
  { min: 500000, max: 1000000, rate: 0.125 },
] as const;

function asBMInputs(inputs?: unknown): Partial<BMCalculatorInputs> {
  return (inputs ?? {}) as Partial<BMCalculatorInputs>;
}

export function calculateBMHealthInsuranceDeductionLimit(
  inputs?: unknown,
): number {
  const bmInputs = asBMInputs(inputs);
  const coveredPeople = 1 + (bmInputs.nonWorkingSpouseHealthCoverage ? 1 : 0);

  return BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL * coveredPeople;
}

export const BM_TAX_CONFIG = {
  code: "BM",
  currency: "BMD",
  taxYear: BM_TAX_YEAR,
  defaultSalary: 100000,
  incomeTaxName: "Employee payroll tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [...BM_PAYROLL_TAX_BRACKETS],
  resolveBrackets: ({ inputs }) =>
    asBMInputs(inputs).payrollTaxDeducted === false
      ? [{ min: 0, max: Infinity, rate: 0 }]
      : [...BM_PAYROLL_TAX_BRACKETS],
  resolveSocialContributions: ({ grossSalary, inputs }) => [
    ...(asBMInputs(inputs).socialInsuranceCovered === false
      ? []
      : [
          {
            name: "Employee social insurance contribution",
            amount:
              grossSalary > 0
                ? BM_EMPLOYEE_SOCIAL_INSURANCE_WEEKLY * WEEKS_PER_YEAR
                : 0,
            preTax: false,
          },
        ]),
      ...(asBMInputs(inputs).occupationalPensionTreatment === "employeeDeducted"
        ? [
            {
              name: "Occupational pension employee contribution",
              rate: BM_OCCUPATIONAL_PENSION_EMPLOYEE_RATE,
              calculateAmount: (context: { inputs: { grossSalary: number } }) =>
                Math.max(0, context.inputs.grossSalary ?? 0) *
                BM_OCCUPATIONAL_PENSION_EMPLOYEE_RATE,
              preTax: false,
            },
          ]
        : []),
  ],
  voluntaryContributions: [
    {
      key: "insurancePremiums",
      name: "Health insurance payroll deduction",
      calculateLimit: ({ inputs }) =>
        calculateBMHealthInsuranceDeductionLimit(inputs),
      description:
        "Annual employee payroll deduction for Bermuda health insurance, capped at one-half of the 2026 standard premium rate for the employee and, when selected, a non-working spouse.",
      taxTreatment: "none",
      cashFlowTreatment: "deductFromNet",
    },
  ],
  assumptions: [
    "Bermuda has no personal income tax; the model treats employee-share payroll tax as the main salary tax deduction.",
    "Employee payroll tax uses the April 1, 2026 to March 31, 2027 marginal bands and the BMD 1,000,000 annual remuneration cap when employee payroll tax is deducted from pay.",
    "Taxable remuneration includes wages/salaries and benefits paid in cash or in kind; entered taxable benefits increase the payroll-tax base but are not cash salary.",
    "Employee social insurance is modeled at BMD 37.65 per week for a full-year covered employee over age 18.",
    "Occupational pension is modeled as a 5% employee deduction on cash salary when the employee is covered and the employer does not pay the employee share on their behalf.",
    "Health insurance is modeled as an employee payroll deduction input capped at one-half of the 2026 standard premium rate for the employee and selected non-working spouse coverage.",
  ],
  modeledExclusions: [
    "Employer payroll tax, payroll-tax relief classes, employer-paid health or pension shares, pension-plan enhancements above the required 5% employee share, health premiums above the standard-premium deduction cap, and benefit valuation details beyond the entered taxable amount are outside this employee take-home model.",
  ],
  sourceUrls: [...BM_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BM">;
