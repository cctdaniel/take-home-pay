import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { MUCalculatorInputs } from "../types";

export const MU_TAX_YEAR = 2026;
export const MU_ZERO_RATE_BAND = 500000;
export const MU_CSG_HIGH_SALARY_MONTHLY_THRESHOLD = 50000;
export const MU_PERSONAL_PENSION_LIMIT = 50000;
export const MU_CHARITY_DONATION_LIMIT = 100000;
export const MU_PRIVATE_SCHOOL_PER_CHILD_LIMIT = 60000;
export const MU_TERTIARY_EDUCATION_PER_CHILD_LIMIT = 500000;
export const MU_CARER_WAGE_LIMIT = 30000;
export const MU_DEPENDENT_DEDUCTION_AMOUNTS = [0, 110000, 190000, 275000, 355000] as const;
export const MU_MEDICAL_INSURANCE_RELIEF_AMOUNTS = [25000, 25000, 20000, 20000, 20000] as const;

export const MU_SOURCE_URLS = [
  "https://www.mra.mu/download/PayrollTaxes.pdf",
  "https://mra.mu/index.php/individuals/reliefs-deductions-allowances",
  "https://www.mra.mu/index.php/business/csg",
  "https://taxsummaries.pwc.com/mauritius/individual/taxes-on-personal-income",
] as const;

function asMUInputs(inputs?: unknown): Partial<MUCalculatorInputs> {
  return (inputs ?? {}) as Partial<MUCalculatorInputs>;
}

function calculateCsgEmployeeContribution(grossSalary: number): number {
  const monthlySalary = grossSalary / 12;
  const rate = monthlySalary > MU_CSG_HIGH_SALARY_MONTHLY_THRESHOLD ? 0.03 : 0.015;

  return grossSalary * rate;
}

function getDependentDeduction(inputs?: unknown): number {
  const dependents = Math.min(
    Math.max(0, asMUInputs(inputs).numberOfDependents ?? 0),
    4,
  );

  return MU_DEPENDENT_DEDUCTION_AMOUNTS[dependents];
}

function getMedicalInsuranceLimit(inputs?: unknown): number {
  const dependents = Math.min(
    Math.max(0, asMUInputs(inputs).numberOfDependents ?? 0),
    4,
  );

  return MU_MEDICAL_INSURANCE_RELIEF_AMOUNTS.slice(0, dependents + 1).reduce(
    (sum, amount) => sum + amount,
    0,
  );
}

function getPrivateSchoolLimit(inputs?: unknown): number {
  const privateSchoolDependents = Math.min(
    Math.max(0, asMUInputs(inputs).numberOfPrivateSchoolDependents ?? 0),
    Math.min(Math.max(0, asMUInputs(inputs).numberOfDependents ?? 0), 4),
  );

  return privateSchoolDependents * MU_PRIVATE_SCHOOL_PER_CHILD_LIMIT;
}

function getTertiaryEducationLimit(inputs?: unknown): number {
  const tertiaryEducationDependents = Math.min(
    Math.max(0, asMUInputs(inputs).numberOfTertiaryEducationDependents ?? 0),
    Math.min(Math.max(0, asMUInputs(inputs).numberOfDependents ?? 0), 4),
  );

  return tertiaryEducationDependents * MU_TERTIARY_EDUCATION_PER_CHILD_LIMIT;
}

export const MU_TAX_CONFIG = {
  code: "MU",
  currency: "MUR",
  taxYear: MU_TAX_YEAR,
  defaultSalary: 1200000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Deduction for dependents",
      calculateAmount: ({ inputs }) => getDependentDeduction(inputs),
    },
  ],
  taxCredits: [],
  brackets: [
    { min: 0, max: MU_ZERO_RATE_BAND, rate: 0 },
    { min: 500000, max: 1000000, rate: 0.1 },
    { min: 1000000, max: 12000000, rate: 0.2 },
    { min: 12000000, max: Infinity, rate: 0.35 },
  ],
  socialContributions: [
    {
      name: "CSG employee contribution",
      calculateAmount: ({ grossSalary }) =>
        calculateCsgEmployeeContribution(grossSalary),
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Approved personal pension scheme contribution",
      limit: MU_PERSONAL_PENSION_LIMIT,
      description:
        "Deduction for contribution to an approved personal pension scheme, capped at Rs 50,000 for the income year.",
      taxTreatment: "deduction",
    },
    {
      key: "insurancePremiums",
      name: "Medical insurance premium relief",
      calculateLimit: ({ inputs }) => getMedicalInsuranceLimit(inputs),
      description:
        "Relief for medical or health insurance premium for self and claimed dependents, using the MRA per-person caps.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Electronic charitable donations",
      limit: MU_CHARITY_DONATION_LIMIT,
      description:
        "MRA deduction for electronic donations to charitable institutions, capped at Rs 100,000.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Fee-paying private school deduction",
      calculateLimit: ({ inputs }) => getPrivateSchoolLimit(inputs),
      description:
        "Additional deduction for fee-paying private primary or secondary school fees, capped at Rs 60,000 per eligible dependent.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "tertiaryEducationExpenses",
      name: "Dependent tertiary education deduction",
      calculateLimit: ({ inputs }) => getTertiaryEducationLimit(inputs),
      description:
        "Additional deduction for a dependent child pursuing a non-sponsored full-time undergraduate or postgraduate course, capped at Rs 500,000 per eligible dependent.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "carerWages",
      name: "Carer wage deduction",
      limit: MU_CARER_WAGE_LIMIT,
      description:
        "Deduction for wages paid to eligible carer employees where required contributions are paid, capped at Rs 30,000.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "housingExpenses",
      name: "Secured housing loan interest",
      calculateLimit: ({ grossSalary }) => grossSalary,
      description:
        "Housing loan interest or profit-charge relief is modeled as entered and capped to salary in this salary-only model.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Solar, rainwater, or fast charger investment",
      calculateLimit: ({ grossSalary }) => grossSalary,
      description:
        "MRA green-investment allowances are modeled as entered and capped to salary in this salary-only model.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Mauritius uses the MRA PAYE income year 1 July 2025 to 30 June 2026 resident tax bands: 0% on the first Rs500,000, 10% on the next Rs500,000, and 20% thereafter.",
    "The Fair Share Contribution is modeled as an additional 15 percentage points on chargeable income above Rs12 million for ordinary salary with no dividend income.",
    "CSG employee contribution is modeled at 1.5% when monthly salary is up to Rs50,000 and 3% when monthly salary exceeds Rs50,000.",
    "Dependent deductions, approved personal pension, medical insurance, charity, private-school, tertiary-education, carer-wage, housing-interest, and green-investment reliefs use the MRA caps for income year ending 30 June 2026.",
  ],
  modeledExclusions: [
    "Dependent income tests, CSG income allowance, Revenue Minimum Garantie, NSF employee contribution, and employer-side contributions are excluded.",
  ],
  sourceUrls: [...MU_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"MU">;
