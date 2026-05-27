import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { MECalculatorInputs } from "../types";

export const ME_TAX_YEAR = 2026;

export const ME_MUNICIPAL_SURTAX_RATES = {
  standard13: {
    name: "Most municipalities",
    rate: 0.13,
  },
  podgoricaCetinje15: {
    name: "Podgorica / Cetinje",
    rate: 0.15,
  },
  budva10: {
    name: "Budva",
    rate: 0.1,
  },
} as const;

export const ME_SOURCE_URLS = [
  "https://www.gov.me/en/tax-administration",
  "https://wapi.gov.me/download/d93f2f4f-b97b-44fc-9409-7bf26be031c1?version=1.0",
  "https://wapi.gov.me/download/efe189ae-149e-40e4-8bed-edea25b5935b?version=1.0",
  "https://digitalnomads.gov.me/article/legal-status-for-nomads",
  "https://biznis.gov.me/en/guides-and-information/why-invest-in-montenegro",
  "https://opendata.gov.me/en/dataset/prosjecne-zarade-plate-oktobar-2025",
  "https://taxsummaries.pwc.com/montenegro/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/Montenegro/Individual/Other-tax-credits-and-incentives",
  "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
  "https://eporezi.me/en/vodici/obracun-plate",
  "https://www.obracun.me/en/salary",
] as const;

const MONTHS_PER_YEAR = 12;
const MONTHLY_TAX_FREE_SALARY = 700;
const MONTHLY_LOWER_TAX_BAND_LIMIT = 1000;
const ME_PAYROLL_PERSONAL_ALLOWANCE = MONTHLY_TAX_FREE_SALARY * MONTHS_PER_YEAR;
const ME_PAYROLL_TAX_BRACKETS = [
  {
    min: 0,
    max:
      (MONTHLY_LOWER_TAX_BAND_LIMIT - MONTHLY_TAX_FREE_SALARY) *
      MONTHS_PER_YEAR,
    rate: 0.09,
  },
  { min: 3600, max: Infinity, rate: 0.15 },
];
const ME_PAYROLL_SOCIAL_CONTRIBUTIONS = [
  {
    name: "Pension and disability insurance employee contribution",
    rate: 0.1,
    preTax: false,
  },
  {
    name: "Unemployment insurance employee contribution",
    rate: 0.005,
    preTax: false,
  },
];

function asMEInputs(inputs?: unknown): Partial<MECalculatorInputs> {
  return (inputs ?? {}) as Partial<MECalculatorInputs>;
}

function isDigitalNomadForeignSource(inputs?: unknown): boolean {
  return asMEInputs(inputs).incomeScenario === "digitalNomadForeignSource";
}

export const ME_TAX_CONFIG = {
  code: "ME",
  currency: "EUR",
  taxYear: ME_TAX_YEAR,
  defaultSalary: 36000,
  incomeTaxName: "Personal income tax",
  personalAllowance: ME_PAYROLL_PERSONAL_ALLOWANCE,
  resolvePersonalAllowance: ({ grossSalary, inputs }) =>
    isDigitalNomadForeignSource(inputs)
      ? Math.max(0, grossSalary)
      : ME_PAYROLL_PERSONAL_ALLOWANCE,
  deductions: [],
  taxCredits: [],
  brackets: ME_PAYROLL_TAX_BRACKETS,
  resolveBrackets: ({ inputs }) =>
    isDigitalNomadForeignSource(inputs)
      ? [{ min: 0, max: Infinity, rate: 0 }]
      : ME_PAYROLL_TAX_BRACKETS,
  resolveSocialContributions: ({ inputs }) =>
    isDigitalNomadForeignSource(inputs) ? [] : ME_PAYROLL_SOCIAL_CONTRIBUTIONS,
  voluntaryContributions: [],
  assumptions: [
    "Montenegro salary PIT is modeled with the monthly bands annualized: EUR 700 tax-free, 9% from EUR 700.01 to EUR 1,000, and 15% above EUR 1,000.",
    "Employee social insurance is modeled as 10% pension and disability insurance plus 0.5% unemployment insurance on gross salary.",
    "Taxable benefits in kind can be entered separately from cash salary; official wage statistics describe gross wage as including other personal benefits subject to personal income tax.",
    "The digital-nomad foreign-source scenario models the income-tax and contribution exemption for income from an employer or own company not registered in Montenegro when digital-nomad status applies.",
    "Municipal surtax is treated as an employer payroll cost, not an employee net-pay deduction.",
  ],
  modeledExclusions: [
    "No voluntary pension, donation, family, medical, or education deduction slider is shown for ordinary salary because the reviewed Montenegro salary rules tax gross personal earnings and do not provide a general employee salary deduction for those amounts.",
    "Employer payroll costs, including municipal surtax, employer unemployment, labour fund, chamber, and union contributions, are not deducted from employee take-home pay.",
    "Montenegro-source work by digital nomads, special compensation rules beyond entered taxable in-kind benefits, treaty positions, and self-employment taxation outside the digital-nomad foreign-source scenario are not modeled.",
  ],
  sourceUrls: [...ME_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"ME">;
