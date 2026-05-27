import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { JOCalculatorInputs } from "../types";

export const JO_TAX_YEAR = 2026;

export const JO_SOURCE_URLS = [
  "https://istd.gov.jo/ebv4.0/root_storage/en/eb_list_page/income_tax_law_no34.pdf",
  "https://istd.gov.jo/ebv4.0/root_storage/en/eb_list_page/guideline_%26_instructions_for_filling_the_employees%E2%80%99_tax_return_for_the_year_2020_and_beyond.pdf",
  "https://istd.gov.jo/ebv4.0/root_storage/en/eb_list_page/pit_return_employer_2021_and_beyond.pdf",
  "https://istd.gov.jo/En/NewsDetails/Withholding_tax_from_salaries_and_wages_does_not_exempt_the_obligated_taxpayer__from_submitting_an_income_return",
  "https://istd.gov.jo/Ar/NewsDetails/%D8%A7%D9%84%D8%AF%D8%A7%D8%A6%D8%B1%D8%A9_%D8%AA%D8%AF%D8%B9%D9%88_%D9%84%D8%AA%D9%88%D8%B1%D9%8A%D8%AF_%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D9%87%D9%85%D8%A9_%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A%D8%A9_%D8%A8%D8%B4%D9%83%D9%84_%D9%85%D9%86%D9%81%D8%B5%D9%84",
  "https://www.ssc.gov.jo/en/about-the-corporation/",
  "https://www.ssc.gov.jo/wp-content/uploads/2025/02/law-26.1.2025-compressed.pdf",
  "https://petra.gov.jo/en/news/ssc-says-jd3733-maximum-wage-for-social-security-deductions%C2%A0",
  "https://taxsummaries.pwc.com/jordan/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/jordan/individual/deductions",
] as const;

const JO_PERSONAL_EXEMPTION = 9000;
const JO_DEPENDENT_EXEMPTION = 9000;
const JO_SINGLE_QUALIFYING_EXPENSE_CAP = 1000;
const JO_DEPENDENT_QUALIFYING_EXPENSE_CAP = 3000;
export const JO_2026_SSC_MONTHLY_CAP = 3733;
export const JO_SSC_EMPLOYEE_RATE = 0.075;
const JO_APPROVED_CHARITY_LIMIT_RATE = 0.25;

function hasResidentDependents(inputs?: Partial<JOCalculatorInputs>): boolean {
  return inputs?.hasResidentDependents ?? false;
}

function getPersonalExemption(inputs?: Partial<JOCalculatorInputs>): number {
  return (
    JO_PERSONAL_EXEMPTION +
    (hasResidentDependents(inputs) ? JO_DEPENDENT_EXEMPTION : 0)
  );
}

function getQualifyingExpenseLimit(inputs?: Partial<JOCalculatorInputs>) {
  return hasResidentDependents(inputs)
    ? JO_DEPENDENT_QUALIFYING_EXPENSE_CAP
    : JO_SINGLE_QUALIFYING_EXPENSE_CAP;
}

function getModeledQualifyingExpenses(inputs?: Partial<JOCalculatorInputs>) {
  return Math.min(
    Math.max(0, inputs?.contributions?.qualifyingExpenses ?? 0),
    getQualifyingExpenseLimit(inputs),
  );
}

function getDonationBase(grossSalary: number, inputs?: Partial<JOCalculatorInputs>) {
  return Math.max(
    0,
    grossSalary - getPersonalExemption(inputs) - getModeledQualifyingExpenses(inputs),
  );
}

function getGovernmentDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  return getDonationBase(grossSalary, inputs as Partial<JOCalculatorInputs>);
}

function getApprovedCharityLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const joInputs = inputs as Partial<JOCalculatorInputs> | undefined;
  const governmentDonations = Math.min(
    Math.max(0, joInputs?.contributions?.housingExpenses ?? 0),
    getGovernmentDonationLimit({ grossSalary, inputs }),
  );

  return Math.max(
    0,
    (getDonationBase(grossSalary, joInputs) - governmentDonations) *
      JO_APPROVED_CHARITY_LIMIT_RATE,
  );
}

export function getJordanSscMonthlyWage({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const joInputs = inputs as Partial<JOCalculatorInputs> | undefined;
  const monthlyCashSalary = Math.max(0, grossSalary) / 12;
  const enteredMonthlyWage = joInputs?.sscMonthlyWage ?? 0;

  return Math.min(
    enteredMonthlyWage > 0 ? enteredMonthlyWage : monthlyCashSalary,
    Math.min(monthlyCashSalary, JO_2026_SSC_MONTHLY_CAP),
  );
}

export const JO_TAX_CONFIG = {
  code: "JO",
  currency: "JOD",
  taxYear: JO_TAX_YEAR,
  defaultSalary: 48000,
  incomeTaxName: "Income tax",
  personalAllowance: JO_PERSONAL_EXEMPTION,
  resolvePersonalAllowance: ({ inputs }) =>
    getPersonalExemption(inputs as Partial<JOCalculatorInputs>),
  deductions: [],
  taxCredits: [],
  brackets: [
    { min: 0, max: 5000, rate: 0.05 },
    { min: 5000, max: 10000, rate: 0.1 },
    { min: 10000, max: 15000, rate: 0.15 },
    { min: 15000, max: 20000, rate: 0.2 },
    { min: 20000, max: 1000000, rate: 0.25 },
    { min: 1000000, max: Infinity, rate: 0.3 },
  ],
  socialContributions: [
    {
      name: "Social Security employee contribution",
      rate: JO_SSC_EMPLOYEE_RATE,
      cap: JO_2026_SSC_MONTHLY_CAP * 12,
      calculateAmount: ({ grossSalary, inputs }) =>
        getJordanSscMonthlyWage({ grossSalary, inputs }) *
        12 *
        JO_SSC_EMPLOYEE_RATE,
      preTax: false,
    },
  ],
  postTaxSocialContributions: [
    {
      name: "National contribution tax",
      calculateAmount: ({ taxableIncome }) =>
        Math.max(0, taxableIncome - 200000) * 0.01,
    },
  ],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "Medical, education, rent, and housing expenses",
      calculateLimit: ({ inputs }) =>
        getQualifyingExpenseLimit(inputs as Partial<JOCalculatorInputs>),
      description:
        "Modeled Jordan personal expense exemption for medical, education, rent, housing interest, or housing murabaha expenses.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "housingExpenses",
      name: "Government/public institution donations",
      calculateLimit: getGovernmentDonationLimit,
      description:
        "Modeled deduction for donations to government departments, public or official institutions, or municipalities, capped here to the remaining salary tax base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Approved charity donations",
      calculateLimit: getApprovedCharityLimit,
      description:
        "Modeled approved donations/subscriptions without personal benefit, capped at 25% of the remaining taxable base after the personal and expense exemptions and government donations.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Jordan PIT is modeled with the 2026 progressive individual rates and the 1% national contribution tax on annual taxable income above JOD 200,000.",
    "The taxpayer personal exemption is JOD 9,000; the resident-dependants option adds a simplified JOD 9,000 dependant exemption.",
    "Qualifying personal expenses are modeled as a taxable-income exemption capped at JOD 1,000 without dependants and JOD 3,000 with resident dependants.",
    "Government/public-institution donations and approved charitable donations are modeled as annual-return deductions with the configured caps.",
    "Social Security is modeled at the 7.5% employee rate on the selected monthly SSC contribution wage, capped at the 2026 maximum wage of JOD 3,733.",
  ],
  modeledExclusions: [
    "Detailed spouse/child expense categories, family exemption cap edge cases, foreign tax credits, employer social security, and special zone rules are excluded.",
    "Social Security is treated as a cash payroll deduction and not as an income-tax-base deduction because the reviewed ISTD return guidance lists personal exemptions, expenses, and donations as the modeled PIT deduction items.",
  ],
  sourceUrls: [...JO_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"JO">;
