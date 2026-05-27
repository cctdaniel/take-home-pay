import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { MACalculatorInputs } from "../types";

export const MA_TAX_YEAR = 2026;

export const MA_SOURCE_URLS = [
  "https://www.tax.gov.ma/wps/portal/DGI/Vos-impots-procedures/Impots-sur-le-revenu",
  "https://www.tgr.gov.ma/wps/wcm/connect/9856b6bb-dee8-4578-bfe8-ef1521dcc80f/CGI%2B2026%2BFR.pdf?MOD=AJPERES",
  "https://taxsummaries.pwc.com/morocco/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/morocco/individual/deductions",
  "https://taxsummaries.pwc.com/morocco/individual/income-determination",
  "https://taxsummaries.pwc.com/morocco/individual/other-taxes",
  "https://acaps.ma/sites/default/files/fiche_synthetique_cnss.pdf",
  "https://www.upsilon-consulting.com/en/cnss-contributions-morocco-2026/",
] as const;

const MA_MONTHS_PER_YEAR = 12;
export const MA_CNSS_MONTHLY_CAP = 6000;
const MA_CNSS_ANNUAL_CAP = MA_CNSS_MONTHLY_CAP * MA_MONTHS_PER_YEAR;
const MA_CNSS_EMPLOYEE_RATE = 0.0448;
const MA_AMO_EMPLOYEE_RATE = 0.0226;
const MA_PROFESSIONAL_EXPENSE_LOW_INCOME_THRESHOLD = 78000;
const MA_PROFESSIONAL_EXPENSE_LOW_INCOME_RATE = 0.35;
const MA_PROFESSIONAL_EXPENSE_STANDARD_RATE = 0.25;
const MA_PROFESSIONAL_EXPENSE_CAP = 35000;
export const MA_FAMILY_CHARGE_TAX_REDUCTION = 600;
export const MA_FAMILY_CHARGE_DEPENDENT_CAP = 6;
export const MA_MORTGAGE_INTEREST_LIMIT_RATE = 0.1;

export function getMoroccoSocialMonthlyWage({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const maInputs = asMAInputs(inputs);
  const enteredMonthlyWage = maInputs.cnssAmoMonthlyWage ?? 0;
  const monthlyCashGross = Math.max(0, grossSalary) / MA_MONTHS_PER_YEAR;

  return Math.min(
    enteredMonthlyWage > 0 ? enteredMonthlyWage : monthlyCashGross,
    monthlyCashGross,
  );
}

export function getMoroccoCnssSocialAnnualBase({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return (
    Math.min(
      getMoroccoSocialMonthlyWage({ grossSalary, inputs }),
      MA_CNSS_MONTHLY_CAP,
    ) * MA_MONTHS_PER_YEAR
  );
}

export function getMoroccoAmoAnnualBase({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return getMoroccoSocialMonthlyWage({ grossSalary, inputs }) * MA_MONTHS_PER_YEAR;
}

function calculateMoroccoSocialContributions(
  grossSalary: number,
  inputs?: unknown,
): number {
  return (
    getMoroccoCnssSocialAnnualBase({ grossSalary, inputs }) *
      MA_CNSS_EMPLOYEE_RATE +
    getMoroccoAmoAnnualBase({ grossSalary, inputs }) * MA_AMO_EMPLOYEE_RATE
  );
}

function calculateMoroccoProfessionalExpenseDeduction(
  grossSalary: number,
): number {
  const rate =
    grossSalary <= MA_PROFESSIONAL_EXPENSE_LOW_INCOME_THRESHOLD
      ? MA_PROFESSIONAL_EXPENSE_LOW_INCOME_RATE
      : MA_PROFESSIONAL_EXPENSE_STANDARD_RATE;

  return Math.min(grossSalary * rate, MA_PROFESSIONAL_EXPENSE_CAP);
}

function calculateMoroccoNetTaxableSalaryBeforePensionInsurance(
  grossSalary: number,
  inputs?: unknown,
): number {
  return Math.max(
    0,
    grossSalary -
      calculateMoroccoSocialContributions(grossSalary, inputs) -
      calculateMoroccoProfessionalExpenseDeduction(grossSalary),
  );
}

function asMAInputs(inputs?: unknown): Partial<MACalculatorInputs> {
  return (inputs ?? {}) as Partial<MACalculatorInputs>;
}

function getContributionValue(
  inputs: Partial<MACalculatorInputs> | undefined,
  key: keyof MACalculatorInputs["contributions"],
): number {
  return Math.max(0, inputs?.contributions?.[key] ?? 0);
}

function calculatePensionInsuranceLimit(
  grossSalary: number,
  inputs?: unknown,
): number {
  return (
    calculateMoroccoNetTaxableSalaryBeforePensionInsurance(grossSalary, inputs) *
    0.5
  );
}

function calculateModeledPensionInsurance(
  grossSalary: number,
  inputs?: unknown,
): number {
  return Math.min(
    getContributionValue(asMAInputs(inputs), "retirementContribution"),
    calculatePensionInsuranceLimit(grossSalary, inputs),
  );
}

function calculateNetTaxableSalaryBeforeHousingAndCharity(
  grossSalary: number,
  inputs?: unknown,
): number {
  return Math.max(
    0,
    calculateMoroccoNetTaxableSalaryBeforePensionInsurance(grossSalary, inputs) -
      calculateModeledPensionInsurance(grossSalary, inputs),
  );
}

function calculateMortgageInterestLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return (
    calculateNetTaxableSalaryBeforeHousingAndCharity(grossSalary, inputs) *
    MA_MORTGAGE_INTEREST_LIMIT_RATE
  );
}

function calculateModeledMortgageInterest(
  grossSalary: number,
  inputs?: unknown,
): number {
  return Math.min(
    getContributionValue(asMAInputs(inputs), "housingExpenses"),
    calculateMortgageInterestLimit({ grossSalary, inputs }),
  );
}

function calculateCharitableDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return Math.max(
    0,
    calculateNetTaxableSalaryBeforeHousingAndCharity(grossSalary, inputs) -
      calculateModeledMortgageInterest(grossSalary, inputs),
  );
}

function calculateFamilyChargeTaxReduction(inputs?: unknown): number {
  const dependents = Math.min(
    Math.max(0, Math.floor(asMAInputs(inputs).numberOfDependents ?? 0)),
    MA_FAMILY_CHARGE_DEPENDENT_CAP,
  );

  return dependents * MA_FAMILY_CHARGE_TAX_REDUCTION;
}

function calculateFirstEmploymentTaxReduction({
  grossIncomeTax,
  inputs,
}: {
  grossIncomeTax: number;
  inputs?: unknown;
}): number {
  return asMAInputs(inputs).firstEmploymentExemption
    ? Math.max(0, grossIncomeTax)
    : 0;
}

export const MA_TAX_CONFIG = {
  code: "MA",
  currency: "MAD",
  taxYear: MA_TAX_YEAR,
  defaultSalary: 360000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Professional expense deduction",
      calculateAmount: ({ grossSalary }) =>
        calculateMoroccoProfessionalExpenseDeduction(grossSalary),
    },
  ],
  taxCredits: [
    {
      name: "Family charge tax reduction",
      calculate: ({ inputs }) => calculateFamilyChargeTaxReduction(inputs),
    },
    {
      name: "First-employment IR exemption",
      calculate: ({ grossIncomeTax, inputs }) =>
        calculateFirstEmploymentTaxReduction({ grossIncomeTax, inputs }),
    },
  ],
  brackets: [
    { min: 0, max: 40000, rate: 0 },
    { min: 40000, max: 60000, rate: 0.1 },
    { min: 60000, max: 80000, rate: 0.2 },
    { min: 80000, max: 100000, rate: 0.3 },
    { min: 100000, max: 180000, rate: 0.34 },
    { min: 180000, max: Infinity, rate: 0.37 },
  ],
  socialContributions: [
    {
      name: "CNSS employee contribution",
      rate: MA_CNSS_EMPLOYEE_RATE,
      cap: MA_CNSS_ANNUAL_CAP,
      calculateAmount: ({ grossSalary, inputs }) =>
        getMoroccoCnssSocialAnnualBase({ grossSalary, inputs }) *
        MA_CNSS_EMPLOYEE_RATE,
      preTax: true,
    },
    {
      name: "AMO health employee contribution",
      rate: MA_AMO_EMPLOYEE_RATE,
      calculateAmount: ({ grossSalary, inputs }) =>
        getMoroccoAmoAnnualBase({ grossSalary, inputs }) *
        MA_AMO_EMPLOYEE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Pension insurance contribution",
      calculateLimit: ({ grossSalary, inputs }) =>
        calculatePensionInsuranceLimit(grossSalary, inputs),
      description:
        "Modeled salary-only pension insurance deduction, capped at 50% of net taxable salary before this contribution.",
      taxTreatment: "deduction",
    },
    {
      key: "housingExpenses",
      name: "Main-home mortgage interest",
      calculateLimit: calculateMortgageInterestLimit,
      description:
        "Modeled main-home mortgage interest deduction capped at 10% of salary-only taxable revenue before mortgage and charitable deductions.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Recognized charitable contributions",
      calculateLimit: calculateCharitableDonationLimit,
      description:
        "Modeled deductible charitable contributions to organizations expressly provided by Moroccan tax law, capped here to the remaining modeled salary tax base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Morocco resident salary is modeled with the 2026 progressive annual income tax bands.",
    "CNSS employee contributions are modeled at 4.48% on the selected CNSS/AMO wage capped at MAD 6,000 per month, and AMO at 2.26% on the selected uncapped wage.",
    "The professional expense deduction is modeled at 35% for gross annual taxable salary up to MAD 78,000 and 25% above that, capped at MAD 35,000.",
    "The pension insurance contribution input is modeled for salary-only taxpayers at up to 50% of net taxable salary before the contribution.",
    "Family charge reductions are modeled as MAD 600 per dependent, capped at six dependents for salary-only annual tax.",
    "The first-employment exemption toggle is modeled as a full income-tax credit for eligible first Moroccan CDI salary during the statutory 36-month exemption window.",
    "Main-home mortgage interest and recognized charitable contributions are modeled as annual-return tax deductions from the salary-only tax base.",
  ],
  modeledExclusions: [
    "CIMR employer-plan mechanics, donation eligibility documentation, exempt allowance classifications, treaty-based social security exemptions, and non-salary income categories are not modeled.",
    "The DGI page is protected by an anti-bot challenge in this environment, so the model also keeps PwC and payroll-practitioner cross-check sources beside the official DGI URL.",
  ],
  sourceUrls: [...MA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"MA">;
