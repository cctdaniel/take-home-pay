import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { KHCalculatorInputs } from "../types";

export const KH_TAX_YEAR = 2026;

export const KH_SOURCE_URLS = [
  "https://www.tax.gov.kh/en/content-detail/MzM3Nzc=",
  "https://www.tax.gov.kh/en/content-detail/JyFtr34297316167172",
  "https://www.tax.gov.kh/u6rhf7ogbi6/gdtstream/a2d7cf62-6179-4de3-b75e-5aff8f4a1da3",
  "https://cdc.gov.kh/wp-content/uploads/2022/05/LAW-ON-TAXATION_970108-.pdf",
  "https://taxsummaries.pwc.com/cambodia/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/cambodia/individual/other-taxes",
  "https://nssf.gov.kh/wp-content/uploads/2023/02/10.-prkas-449.pdf",
  "https://www.nssf.gov.kh/wp-content/uploads/2023/02/9.-Sub_Decree_No_32_on_Pension_Scheme_for_Persons_Defined_by_the_Provisions_of-_the_Labour_Law-1.pdf",
  "https://www.issa.int/sites/default/files/documents/2025-10/Cambodia.pdf",
  "https://www.aplusconsulting.com.kh/insight/cambodia-labour-law/nssf",
] as const;

const KH_MONTHS_PER_YEAR = 12;
const KH_DEPENDENT_ALLOWANCE_MONTHLY = 150000;
const KH_MAX_DEPENDENT_CHILDREN = 4;
export const KH_NSSF_HEALTH_MONTHLY_FLOOR = 200000;
export const KH_NSSF_PENSION_MONTHLY_FLOOR = 400000;
export const KH_NSSF_MONTHLY_CEILING = 1200000;
export const KH_NSSF_HEALTH_CARE_EMPLOYEE_RATE = 0.013;
export const KH_NSSF_PENSION_EMPLOYEE_RATE = 0.02;
export const KH_NON_RESIDENT_SALARY_TAX_RATE = 0.2;
export const KH_FRINGE_BENEFIT_TAX_RATE = 0.2;

function getKhInputs(inputs: unknown): Partial<KHCalculatorInputs> {
  return inputs as Partial<KHCalculatorInputs>;
}

function clampDependentChildren(value: unknown): number {
  return Math.trunc(
    Math.min(
      Math.max(typeof value === "number" && Number.isFinite(value) ? value : 0, 0),
      KH_MAX_DEPENDENT_CHILDREN,
    ),
  );
}

function calculateDependentAllowance(inputs: unknown): number {
  const khInputs = getKhInputs(inputs);
  if (khInputs.taxResidency === "nonResident") {
    return 0;
  }

  const spouseAllowance = khInputs.hasDependentSpouse
    ? KH_DEPENDENT_ALLOWANCE_MONTHLY
    : 0;
  const childAllowance =
    clampDependentChildren(khInputs.dependentChildren) *
    KH_DEPENDENT_ALLOWANCE_MONTHLY;

  return (spouseAllowance + childAllowance) * KH_MONTHS_PER_YEAR;
}

export function getCambodiaNssfMonthlyWage({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const khInputs = inputs as Partial<KHCalculatorInputs> | undefined;
  const enteredMonthlyWage = khInputs?.nssfMonthlyWage ?? 0;
  const monthlyCashGross = Math.max(0, grossSalary) / KH_MONTHS_PER_YEAR;

  return Math.min(
    enteredMonthlyWage > 0 ? enteredMonthlyWage : monthlyCashGross,
    Math.min(monthlyCashGross, KH_NSSF_MONTHLY_CEILING),
  );
}

export function getCambodiaNssfHealthCareBaseMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const khInputs = inputs as Partial<KHCalculatorInputs> | undefined;
  const enteredMonthlyWage = khInputs?.nssfMonthlyWage ?? 0;
  const monthlyCashGross = Math.max(0, grossSalary) / KH_MONTHS_PER_YEAR;
  if (
    monthlyCashGross > KH_NSSF_MONTHLY_CEILING &&
    (enteredMonthlyWage <= 0 || enteredMonthlyWage >= KH_NSSF_MONTHLY_CEILING)
  ) {
    return KH_NSSF_MONTHLY_CEILING;
  }

  const monthlyWage = getCambodiaNssfMonthlyWage({ grossSalary, inputs });

  if (monthlyWage <= 0) {
    return 0;
  }

  if (monthlyWage <= KH_NSSF_HEALTH_MONTHLY_FLOOR) {
    return KH_NSSF_HEALTH_MONTHLY_FLOOR;
  }

  if (monthlyWage > KH_NSSF_MONTHLY_CEILING) {
    return KH_NSSF_MONTHLY_CEILING;
  }

  const bandIndex = Math.ceil(
    (monthlyWage - KH_NSSF_HEALTH_MONTHLY_FLOOR) / 50000,
  );
  const assumedWage =
    KH_NSSF_HEALTH_MONTHLY_FLOOR + bandIndex * 50000 - 25000;

  return Math.min(Math.max(assumedWage, 0), KH_NSSF_MONTHLY_CEILING);
}

export function getCambodiaNssfPensionBaseMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const monthlyWage = getCambodiaNssfMonthlyWage({ grossSalary, inputs });

  if (monthlyWage <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(monthlyWage, KH_NSSF_PENSION_MONTHLY_FLOOR),
    KH_NSSF_MONTHLY_CEILING,
  );
}

export const KH_TAX_CONFIG = {
  code: "KH",
  currency: "KHR",
  taxYear: KH_TAX_YEAR,
  defaultSalary: 120000000,
  incomeTaxName: "Tax on salary",
  personalAllowance: 0,
  resolvePersonalAllowance: ({ inputs }) => calculateDependentAllowance(inputs),
  deductions: [],
  taxCredits: [],
  brackets: [
    { min: 0, max: 18000000, rate: 0 },
    { min: 18000000, max: 24000000, rate: 0.05 },
    { min: 24000000, max: 102000000, rate: 0.1 },
    { min: 102000000, max: 150000000, rate: 0.15 },
    { min: 150000000, max: Infinity, rate: 0.2 },
  ],
  resolveBrackets: ({ inputs }) =>
    getKhInputs(inputs).taxResidency === "nonResident"
      ? [{ min: 0, max: Infinity, rate: KH_NON_RESIDENT_SALARY_TAX_RATE }]
      : [
          { min: 0, max: 18000000, rate: 0 },
          { min: 18000000, max: 24000000, rate: 0.05 },
          { min: 24000000, max: 102000000, rate: 0.1 },
          { min: 102000000, max: 150000000, rate: 0.15 },
          { min: 150000000, max: Infinity, rate: 0.2 },
        ],
  socialContributions: [
    {
      name: "NSSF health care employee contribution",
      rate: KH_NSSF_HEALTH_CARE_EMPLOYEE_RATE,
      calculateAmount: ({ grossSalary, inputs }) =>
        getCambodiaNssfHealthCareBaseMonthly({ grossSalary, inputs }) *
        KH_MONTHS_PER_YEAR *
        KH_NSSF_HEALTH_CARE_EMPLOYEE_RATE,
      preTax: false,
    },
    {
      name: "NSSF pension employee contribution",
      rate: KH_NSSF_PENSION_EMPLOYEE_RATE,
      calculateAmount: ({ grossSalary, inputs }) =>
        getCambodiaNssfPensionBaseMonthly({ grossSalary, inputs }) *
        KH_MONTHS_PER_YEAR *
        KH_NSSF_PENSION_EMPLOYEE_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [],
  assumptions: [
    "Cambodia monthly resident tax-on-salary bands are annualized for a full-year employee.",
    "Non-resident salary tax is modeled at the 20% flat rate shown on the current GDT Tax on Salary return.",
    "Taxable fringe benefits are modeled as a separate 20% tax on the entered benefit value and are not added to cash gross salary.",
    "Dependent allowances are modeled at KHR 150,000 per month for a non-working spouse and each minor child, capped at four children.",
    "NSSF health care is modeled at the employee 1.3% share using the Prakas 449 assumed-wage table: KHR 200,000 floor, 50,000 riel bands, and KHR 1,200,000 monthly ceiling.",
    "NSSF pension is modeled at the employee 2.0% share on the selected contributory wage, floored at KHR 400,000 and capped at KHR 1,200,000 per month.",
  ],
  modeledExclusions: [
    "Employer NSSF shares, occupational risk contributions, detailed family documentation rules, and variable exchange-rate rules for foreign-currency wages are excluded.",
    "NSSF voluntary pension contributions above the ceiling are noted in the pension sub-decree, but no salary tax relief or clear employee payroll cap is modeled.",
  ],
  sourceUrls: [...KH_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"KH">;
