import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { ALCalculatorInputs } from "../types";

export const AL_TAX_YEAR = 2026;

export const AL_SOURCE_URLS = [
  "https://www.tatime.gov.al/c/4/96/108/tatimi-mbi-te-ardhurat-personale",
  "https://www.tatime.gov.al/eng/c/3/10/15/declaration",
  "https://www.tatime.gov.al/d/8/45/45/1914/nga-1-janari-2026-rritet-paga-minimale-dhe-maksimale",
  "https://www.tatime.gov.al/eng/c/3/11/25/exempted-income",
  "https://www.tatime.gov.al/eng/c/4/96/111/being-an-employer",
  "https://financa.gov.al/en/newsroom/ministri-petrit-malaj-paraqet-ne-komisionin-e-ekonomise-dhe-ne-komisionin-e-ligjeve-paketen-fiskale-2026/",
  "https://www.pwc.com/al/en/Tax_Alert_January_2025.pdf",
  "https://taxsummaries.pwc.com/albania/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/albania/individual/significant-developments",
  "https://taxsummaries.pwc.com/albania/individual/deductions",
] as const;

const MONTHS_PER_YEAR = 12;
export const AL_MINIMUM_MONTHLY_CONTRIBUTION_SALARY = 50000;
export const AL_MAXIMUM_MONTHLY_SOCIAL_INSURANCE_SALARY = 186416;
export const AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT =
  AL_MINIMUM_MONTHLY_CONTRIBUTION_SALARY * MONTHS_PER_YEAR;
export const AL_DEPENDENT_CHILD_DEDUCTION = 48000;
export const AL_CHILD_EDUCATION_EXPENSE_LIMIT = 100000;
export const AL_CHILD_EDUCATION_INCOME_LIMIT = 1200000;

export function calculateALMonthlySocialInsuranceBase(
  grossSalary: number,
): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const monthlySalary = grossSalary / MONTHS_PER_YEAR;
  return Math.min(
    Math.max(monthlySalary, AL_MINIMUM_MONTHLY_CONTRIBUTION_SALARY),
    AL_MAXIMUM_MONTHLY_SOCIAL_INSURANCE_SALARY,
  );
}

function calculateSocialInsurance(grossSalary: number): number {
  return (
    calculateALMonthlySocialInsuranceBase(grossSalary) *
    MONTHS_PER_YEAR *
    0.095
  );
}

function resolvePersonalAllowance(grossSalary: number, inputs?: unknown): number {
  if (asALInputs(inputs).appliesEmploymentAllowance === false) {
    return 0;
  }

  if (grossSalary <= 600000) {
    return 600000;
  }

  if (grossSalary <= 720000) {
    return 420000;
  }

  return 360000;
}

function asALInputs(inputs?: unknown): Partial<ALCalculatorInputs> {
  return (inputs ?? {}) as Partial<ALCalculatorInputs>;
}

function calculateDependentChildDeduction(inputs?: unknown): number {
  if (asALInputs(inputs).claimsFamilyDivaDeductions === false) {
    return 0;
  }

  const numberOfDependentChildren = Math.min(
    Math.max(0, Math.floor(asALInputs(inputs).numberOfDependentChildren ?? 0)),
    10,
  );

  return numberOfDependentChildren * AL_DEPENDENT_CHILD_DEDUCTION;
}

function calculateChildEducationExpenseLimit(
  grossSalary: number,
  inputs?: unknown,
): number {
  if (asALInputs(inputs).claimsFamilyDivaDeductions === false) {
    return 0;
  }

  if ((asALInputs(inputs).numberOfDependentChildren ?? 0) <= 0) {
    return 0;
  }

  return grossSalary <= AL_CHILD_EDUCATION_INCOME_LIMIT
    ? AL_CHILD_EDUCATION_EXPENSE_LIMIT
    : 0;
}

export const AL_TAX_CONFIG = {
  code: "AL",
  currency: "ALL",
  taxYear: AL_TAX_YEAR,
  defaultSalary: 1800000,
  incomeTaxName: "Personal income tax",
  resolvePersonalAllowance: ({ grossSalary, inputs }) =>
    resolvePersonalAllowance(grossSalary, inputs),
  deductions: [
    {
      name: "Dependent child deduction",
      calculateAmount: ({ inputs }) => calculateDependentChildDeduction(inputs),
    },
  ],
  taxCredits: [],
  brackets: [
    { min: 0, max: 2040000, rate: 0.13 },
    { min: 2040000, max: Infinity, rate: 0.23 },
  ],
  socialContributions: [
    {
      name: "Employee social insurance contribution",
      rate: 0.095,
      calculateAmount: ({ grossSalary }) => calculateSocialInsurance(grossSalary),
      preTax: true,
    },
    {
      name: "Employee health insurance contribution",
      rate: 0.017,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary pension contribution",
      limit: AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT,
      description:
        "Deductible employee voluntary pension contribution, capped here at the annualized 2026 minimum wage threshold.",
      taxTreatment: "deduction",
    },
    {
      key: "educationExpenses",
      name: "Children's education expenses",
      calculateLimit: ({ grossSalary, inputs }) =>
        calculateChildEducationExpenseLimit(grossSalary, inputs),
      description:
        "Annual-return deduction for current children's education expenses, capped at ALL 100,000 when employment/business income is below the modeled ALL 1,200,000 threshold.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Resident employment salary is modeled with the post-2025 annual allowance structure and 13%/23% employment-income rates; turn off the allowance switch for a secondary/no-allowance payroll scenario.",
    "Employee social and health insurance contributions are deducted from taxable income and from net pay; taxable benefits in kind are included in the modeled employment tax and contribution base when entered.",
    "Employee social insurance uses the 2026 monthly contribution salary floor of ALL 50,000 and ceiling of ALL 186,416; health insurance is modeled at 1.7% of taxable employment remuneration.",
    "Voluntary pension contributions are modeled as deductible up to the annualized minimum wage threshold.",
    "Dependent-child deductions and children's education expense deductions are modeled as DIVA annual-return deductions and are applied only when this taxpayer is the family member claiming them.",
  ],
  modeledExclusions: [
    "Employer social and health contributions are payroll costs of the employer and are not deducted from employee take-home pay.",
    "Self-employment contribution bases, business income, investment income, rental income, and treaty withholding applications use separate Albanian return schedules rather than salary inputs.",
    "Document-level proof checks for DIVA child, education, and voluntary pension deductions are not automated; this calculator applies the statutory caps to the amounts you enter.",
  ],
  sourceUrls: [...AL_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"AL">;
