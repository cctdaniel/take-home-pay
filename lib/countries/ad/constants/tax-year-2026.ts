import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { ADCalculatorInputs } from "../types";

export const AD_TAX_YEAR = 2026;

export const AD_SOURCE_URLS = [
  "https://www.govern.ad/ca/l/4191332",
  "https://www.govern.ad/ca/l/4191468",
  "https://www.govern.ad/ca/l/4191472",
  "https://www.govern.ad/ca/l/4191312",
  "https://www.cass.ad/empreses1",
  "https://taxsummaries.pwc.com/andorra/individual/taxes-on-personal-income",
] as const;

export const AD_CASS_EMPLOYEE_RATE = 0.065;
export const AD_EMPLOYMENT_EXPENSE_RATE = 0.03;
export const AD_EMPLOYMENT_EXPENSE_LIMIT = 2500;
const PERSONAL_EXEMPT_AMOUNT = 24000;
export const AD_DISABLED_PERSONAL_EXEMPT_AMOUNT = 30000;
export const AD_NON_WORKING_SPOUSE_PERSONAL_EXEMPT_AMOUNT = 40000;
export const AD_FAMILY_DEPENDENT_REDUCTION = 750;
export const AD_DISABLED_DEPENDENT_COEFFICIENT = 1.5;
export const AD_MORTGAGE_EXPENSE_LIMIT = 4000;
export const AD_MORTGAGE_REDUCTION_RATE = 0.25;
export const AD_MORTGAGE_REDUCTION_LIMIT = 1000;
export const AD_PENSION_DEDUCTION_LIMIT = 5000;

function calculateCassContribution(grossSalary: number): number {
  return grossSalary * AD_CASS_EMPLOYEE_RATE;
}

function calculatePensionDeductionLimit(grossSalary: number): number {
  const netWorkIncome =
    grossSalary -
    calculateCassContribution(grossSalary) -
    grossSalary * AD_EMPLOYMENT_EXPENSE_RATE;

  return Math.min(
    AD_PENSION_DEDUCTION_LIMIT,
    Math.max(0, netWorkIncome) * 0.3,
  );
}

function asADInputs(inputs?: unknown): Partial<ADCalculatorInputs> {
  return (inputs ?? {}) as Partial<ADCalculatorInputs>;
}

function calculatePersonalExemptAmount(inputs?: unknown): number {
  const adInputs = asADInputs(inputs);

  if (adInputs.hasNonWorkingSpouseOrPartner) {
    return AD_NON_WORKING_SPOUSE_PERSONAL_EXEMPT_AMOUNT;
  }

  if (adInputs.isDisabledTaxpayer) {
    return AD_DISABLED_PERSONAL_EXEMPT_AMOUNT;
  }

  return PERSONAL_EXEMPT_AMOUNT;
}

function calculateFamilyDependentReduction(inputs?: unknown): number {
  const adInputs = asADInputs(inputs);
  const dependents = Math.min(
    Math.max(0, Math.floor(adInputs.numberOfFamilyDependents ?? 0)),
    10,
  );
  const disabledDependents = Math.min(
    Math.max(0, Math.floor(adInputs.numberOfDisabledDependents ?? 0)),
    dependents,
  );
  const regularDependents = dependents - disabledDependents;

  return (
    regularDependents * AD_FAMILY_DEPENDENT_REDUCTION +
    disabledDependents *
      AD_FAMILY_DEPENDENT_REDUCTION *
      AD_DISABLED_DEPENDENT_COEFFICIENT
  );
}

function calculateMortgageReduction(inputs?: unknown): number {
  const adInputs = asADInputs(inputs);
  const mortgageExpenses = Math.min(
    Math.max(0, adInputs.contributions?.housingExpenses ?? 0),
    AD_MORTGAGE_EXPENSE_LIMIT,
  );

  return Math.min(
    AD_MORTGAGE_REDUCTION_LIMIT,
    mortgageExpenses * AD_MORTGAGE_REDUCTION_RATE,
  );
}

export const AD_TAX_CONFIG = {
  code: "AD",
  currency: "EUR",
  taxYear: AD_TAX_YEAR,
  defaultSalary: 50000,
  incomeTaxName: "Personal income tax",
  personalAllowance: PERSONAL_EXEMPT_AMOUNT,
  resolvePersonalAllowance: ({ inputs }) => calculatePersonalExemptAmount(inputs),
  deductions: [
    {
      name: "Employment expense deduction",
      rate: AD_EMPLOYMENT_EXPENSE_RATE,
      cap: AD_EMPLOYMENT_EXPENSE_LIMIT,
    },
    {
      name: "Family dependent reduction",
      calculateAmount: ({ inputs }) => calculateFamilyDependentReduction(inputs),
    },
    {
      name: "Principal residence mortgage reduction",
      calculateAmount: ({ inputs }) => calculateMortgageReduction(inputs),
    },
  ],
  taxCredits: [],
  brackets: [
    { min: 0, max: 16000, rate: 0.05 },
    { min: 16000, max: Infinity, rate: 0.1 },
  ],
  socialContributions: [
    {
      name: "CASS employee contribution",
      rate: AD_CASS_EMPLOYEE_RATE,
      calculateAmount: ({ grossSalary }) => calculateCassContribution(grossSalary),
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Qualifying pension plan contribution",
      calculateLimit: ({ grossSalary }) =>
        calculatePensionDeductionLimit(grossSalary),
      description:
        "Modeled Andorra IRPF pension-plan deduction: the lower of 30% of net work income or EUR 5,000.",
      taxTreatment: "deduction",
    },
    {
      key: "housingExpenses",
      name: "Principal residence mortgage expenses",
      limit: AD_MORTGAGE_EXPENSE_LIMIT,
      description:
        "Modeled Andorra principal-residence mortgage expense input. The tax reduction is 25% of expenses, capped at EUR 1,000.",
      taxTreatment: "none",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Resident employment income is modeled under Andorra IRPF by deducting employee CASS, the 3% work-expense deduction capped at EUR 2,500, and the selected personal exempt amount before applying the 10% tax with the EUR 800 work-income relief reflected as an effective 5% first band.",
    "CASS is modeled at the 6.5% employee share on gross salary and treated as deductible from employment income.",
    "Qualifying pension-plan contributions are modeled up to the lower of 30% of net work income or EUR 5,000.",
    "Family dependent reductions, the disability uplift, and the principal-residence mortgage reduction are modeled from the user inputs shown on the page.",
  ],
  modeledExclusions: [
    "Cross-border worker filing elections, investment-income baskets, self-employment CASS bases, employer pension contributions, and dependent eligibility documentation checks are not modeled.",
  ],
  sourceUrls: [...AD_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"AD">;
