import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { EGCalculatorInputs } from "../types";

export const EG_TAX_YEAR = 2026;

export const EG_SOCIAL_INSURANCE_EMPLOYEE_RATE = 0.11;
export const EG_SOCIAL_INSURANCE_MONTHLY_MIN = 2700;
export const EG_SOCIAL_INSURANCE_MONTHLY_CAP = 16700;
const EG_MONTHS_PER_YEAR = 12;

export const EG_SOURCE_URLS = [
  "https://eta.gov.eg/en/content/income-tax",
  "https://www.eta.gov.eg/ar/periodic-books-instruction/periodical-books",
  "https://www.nosi.gov.eg/ar/News/Pages/2025-11-30.aspx",
  "https://taxsummaries.pwc.com/egypt/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/egypt/individual/income-determination",
  "https://taxsummaries.pwc.com/egypt/individual/deductions",
  "https://taxsummaries.pwc.com/egypt/individual/other-taxes",
  "https://taxsummaries.pwc.com/egypt/individual/other-issues",
] as const;

export function getEgyptSocialInsuranceSalaryMonthly({
  cashSalary,
  inputs,
}: {
  cashSalary: number;
  inputs: EGCalculatorInputs;
}): number {
  if (!inputs.socialInsuranceCovered || cashSalary <= 0) {
    return 0;
  }

  const monthlyCashSalary = Math.max(0, cashSalary) / EG_MONTHS_PER_YEAR;
  const legalBaseUpper = Math.min(
    Math.max(monthlyCashSalary, EG_SOCIAL_INSURANCE_MONTHLY_MIN),
    EG_SOCIAL_INSURANCE_MONTHLY_CAP,
  );
  const enteredMonthlySalary = Math.max(
    0,
    inputs.socialInsuranceSalaryMonthly ?? 0,
  );
  const selectedMonthlySalary =
    enteredMonthlySalary > 0 ? enteredMonthlySalary : legalBaseUpper;

  return Math.min(
    Math.max(selectedMonthlySalary, EG_SOCIAL_INSURANCE_MONTHLY_MIN),
    legalBaseUpper,
  );
}

function resolveEgyptIncomeTaxBrackets(taxableIncome: number) {
  if (taxableIncome > 1200000) {
    return [
      { min: 0, max: 1200000, rate: 0.25 },
      { min: 1200000, max: Infinity, rate: 0.275 },
    ];
  }

  if (taxableIncome > 900000) {
    return [
      { min: 0, max: 400000, rate: 0.225 },
      { min: 400000, max: Infinity, rate: 0.25 },
    ];
  }

  if (taxableIncome > 800000) {
    return [
      { min: 0, max: 200000, rate: 0.2 },
      { min: 200000, max: 400000, rate: 0.225 },
      { min: 400000, max: Infinity, rate: 0.25 },
    ];
  }

  if (taxableIncome > 700000) {
    return [
      { min: 0, max: 70000, rate: 0.15 },
      { min: 70000, max: 200000, rate: 0.2 },
      { min: 200000, max: 400000, rate: 0.225 },
      { min: 400000, max: Infinity, rate: 0.25 },
    ];
  }

  if (taxableIncome > 600000) {
    return [
      { min: 0, max: 55000, rate: 0.1 },
      { min: 55000, max: 70000, rate: 0.15 },
      { min: 70000, max: 200000, rate: 0.2 },
      { min: 200000, max: 400000, rate: 0.225 },
      { min: 400000, max: Infinity, rate: 0.25 },
    ];
  }

  return [
    { min: 0, max: 40000, rate: 0 },
    { min: 40000, max: 55000, rate: 0.1 },
    { min: 55000, max: 70000, rate: 0.15 },
    { min: 70000, max: 200000, rate: 0.2 },
    { min: 200000, max: 400000, rate: 0.225 },
    { min: 400000, max: 1200000, rate: 0.25 },
    { min: 1200000, max: Infinity, rate: 0.275 },
  ];
}

export const EG_TAX_CONFIG = {
  code: "EG",
  currency: "EGP",
  taxYear: EG_TAX_YEAR,
  defaultSalary: 900000,
  incomeTaxName: "Salary tax",
  personalAllowance: 20000,
  deductions: [],
  taxCredits: [],
  brackets: resolveEgyptIncomeTaxBrackets(0),
  resolveBrackets: ({ taxableIncome }) =>
    resolveEgyptIncomeTaxBrackets(taxableIncome),
  resolveSocialContributions: ({ inputs }) =>
    (inputs as EGCalculatorInputs).socialInsuranceCovered === false
      ? []
      : [
          {
            name: "Employee social insurance",
            rate: EG_SOCIAL_INSURANCE_EMPLOYEE_RATE,
            calculateAmount: ({ inputs: contributionInputs }) =>
              getEgyptSocialInsuranceSalaryMonthly({
                cashSalary: (contributionInputs as EGCalculatorInputs)
                  .grossSalary,
                inputs: contributionInputs as EGCalculatorInputs,
              }) *
              EG_MONTHS_PER_YEAR *
              EG_SOCIAL_INSURANCE_EMPLOYEE_RATE,
            preTax: true,
          },
        ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Private pension or life/health insurance premiums",
      calculateLimit: ({ grossSalary }) => Math.min(grossSalary * 0.15, 10000),
      description:
        "Deductible registered private pension, life, or health insurance premiums, capped at 15% of net revenue or EGP 10,000; this model applies the lower EGP 10,000 cap when relevant.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Egypt salary tax is modeled with the EGP 20,000 employee personal exemption and the current progressive annual brackets.",
    "The high-income phase-out of lower tax bands is modeled from the published 2024+ bracket table.",
    "Employee social insurance is modeled at 11% of the selected monthly social-insurance salary, using the 2026 NOSI monthly floor of EGP 2,700 and ceiling of EGP 16,700.",
    "Taxable employment benefits entered separately increase salary tax but do not increase cash take-home pay or the modeled NOSI wage base.",
  ],
  modeledExclusions: [
    "ETA's 2024 donation circular is not exposed as a payroll salary slider here because it concerns donation treatment in return-level/business/professional income contexts and requires income-category facts outside ordinary employment salary.",
    "There are no family allowances in the reviewed Egypt salary-tax guidance; spouse or minor-child life and health insurance premiums are included in the registered-premium deduction slider.",
    "Treaty or certificate-based social-insurance exemptions can be selected with the coverage control; treaty tax positions, monthly payroll timing, unregistered insurance premiums, and other business/professional deductions require filing, payroll-period, registration, or non-employment income facts.",
  ],
  sourceUrls: [...EG_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"EG">;
