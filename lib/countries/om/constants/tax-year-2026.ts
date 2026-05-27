import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { OMCalculatorInputs, OMWorkerType } from "../types";

export const OM_TAX_YEAR = 2026;

export const OM_SOURCE_URLS = [
  "https://taxoman.gov.om/portal/w/issuance-of-personal-income-tax-pit-law",
  "https://taxoman.gov.om/portal/web/taxportal/personal-income-tax-law-and-regulation",
  "https://www.spf.gov.om/en/faq-2/",
  "https://www.spf.gov.om/en/faq/what-are-the-contribution-rates-to-be-paid-by-the-worker-and-employer/",
  "https://www.spf.gov.om/en/faq/do-the-social-insurance-programs-cover-non-omani-workers/",
  "https://www.spf.gov.om/en/insurance_programs/provident-scheme/",
  "https://www.spf.gov.om/en/insurance_programs/extension-insurance-protection/",
  "https://www.spf.gov.om/wp-content/uploads/2024/11/Social-Protaction-Law.pdf",
  "https://www.spf.gov.om/wp-content/uploads/2025/08/ExecutiveRegulationoftheSocialProtectionLawEn.pdf",
  "https://taxsummaries.pwc.com/oman/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/oman/individual/other-taxes",
] as const;

const OM_MONTHS_PER_YEAR = 12;
export const OM_SPF_INSURED_WAGE_MONTHLY_CAP = 3000;
export const OM_SPF_INSURED_WAGE_ANNUAL_CAP =
  OM_SPF_INSURED_WAGE_MONTHLY_CAP * OM_MONTHS_PER_YEAR;
export const OM_OLD_AGE_DISABILITY_DEATH_EMPLOYEE_RATE = 0.075;
export const OM_EMPLOYMENT_SECURITY_EMPLOYEE_RATE = 0.005;
export const OM_EXPAT_PROVIDENT_EMPLOYER_RATE = 0.09;
export const OM_OPTIONAL_SAVINGS_DEPOSIT_MIN = 100;
export const OM_OPTIONAL_SAVINGS_ANNUAL_CAP =
  OM_SPF_INSURED_WAGE_MONTHLY_CAP * OM_MONTHS_PER_YEAR;

function getWorkerType(inputs: OMCalculatorInputs): OMWorkerType {
  return inputs.workerType ?? "expatriate";
}

function clampSpfInsuredWageMonthly(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(value, OM_SPF_INSURED_WAGE_MONTHLY_CAP);
}

function clampMonthlyBasicWage(value: number, grossSalary: number): number {
  if (!Number.isFinite(value) || value <= 0 || grossSalary <= 0) {
    return 0;
  }

  return Math.min(value, grossSalary / OM_MONTHS_PER_YEAR);
}

export function getOmanSpfInsuredWageMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: OMCalculatorInputs;
}): number {
  if (getWorkerType(inputs) !== "omani" || grossSalary <= 0) {
    return 0;
  }

  const enteredMonthlyWage = inputs.spfInsuredWageMonthly;
  const fallbackMonthlyWage = grossSalary / OM_MONTHS_PER_YEAR;

  return clampSpfInsuredWageMonthly(
    enteredMonthlyWage && enteredMonthlyWage > 0
      ? enteredMonthlyWage
      : fallbackMonthlyWage,
  );
}

export function getOmanExpatProvidentBasicWageMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: OMCalculatorInputs;
}): number {
  if (
    getWorkerType(inputs) !== "expatriate" ||
    !inputs.expatProvidentSchemeApplied ||
    grossSalary <= 0
  ) {
    return 0;
  }

  const enteredMonthlyWage = inputs.expatProvidentBasicWageMonthly;
  const fallbackMonthlyWage = grossSalary / OM_MONTHS_PER_YEAR;

  return clampMonthlyBasicWage(
    enteredMonthlyWage && enteredMonthlyWage > 0
      ? enteredMonthlyWage
      : fallbackMonthlyWage,
    grossSalary,
  );
}

export function getOmanExpatProvidentEmployerContributionAnnual({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: OMCalculatorInputs;
}): number {
  return (
    getOmanExpatProvidentBasicWageMonthly({ grossSalary, inputs }) *
    OM_MONTHS_PER_YEAR *
    OM_EXPAT_PROVIDENT_EMPLOYER_RATE
  );
}

export function getOmanOptionalSavingsAnnualLimit(
  inputs?: Partial<OMCalculatorInputs>,
): number {
  if (!inputs || inputs.workerType === "omani") {
    return OM_OPTIONAL_SAVINGS_ANNUAL_CAP;
  }

  return inputs.expatProvidentSchemeApplied
    ? OM_OPTIONAL_SAVINGS_ANNUAL_CAP
    : 0;
}

export const OM_TAX_CONFIG = {
  code: "OM",
  currency: "OMR",
  taxYear: OM_TAX_YEAR,
  defaultSalary: 36000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) =>
    getWorkerType(inputs as OMCalculatorInputs) === "omani"
      ? [
          {
            name: "SPF old-age, disability, and death employee contribution",
            rate: OM_OLD_AGE_DISABILITY_DEATH_EMPLOYEE_RATE,
            cap: OM_SPF_INSURED_WAGE_ANNUAL_CAP,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getOmanSpfInsuredWageMonthly({
                grossSalary,
                inputs: contributionInputs as OMCalculatorInputs,
              }) *
              OM_MONTHS_PER_YEAR *
              OM_OLD_AGE_DISABILITY_DEATH_EMPLOYEE_RATE,
            preTax: false,
          },
          {
            name: "SPF employment security employee contribution",
            rate: OM_EMPLOYMENT_SECURITY_EMPLOYEE_RATE,
            cap: OM_SPF_INSURED_WAGE_ANNUAL_CAP,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getOmanSpfInsuredWageMonthly({
                grossSalary,
                inputs: contributionInputs as OMCalculatorInputs,
              }) *
              OM_MONTHS_PER_YEAR *
              OM_EMPLOYMENT_SECURITY_EMPLOYEE_RATE,
            preTax: false,
          },
        ]
      : [],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Optional SPF savings deposit",
      calculateLimit: ({ inputs }) =>
        getOmanOptionalSavingsAnnualLimit(
          inputs as Partial<OMCalculatorInputs>,
        ),
      description: `Optional savings-system deposits are modeled up to OMR ${OM_OPTIONAL_SAVINGS_ANNUAL_CAP.toLocaleString()} per year. They reduce cash take-home but do not create a 2026 personal income tax deduction.`,
      taxTreatment: "none",
      cashFlowTreatment: "deductFromNet",
    },
  ],
  assumptions: [
    "Oman has no personal income tax on 2026 employment salary; the enacted PIT regime is expected to apply from 1 January 2028.",
    "Expatriate employees default to no employee-side Oman social protection deduction; if the employer's non-Omani provident scheme is enabled, the 9% modeled amount is shown as employer-paid context only.",
    "Omani employees can be selected to include the Social Protection Fund employee shares: 7.5% for old-age, disability, and death insurance plus 0.5% employment security, capped to the selected monthly insured wage up to OMR 3,000.",
    "Optional SPF savings deposits are modeled as employee cash savings, not 2026 income-tax relief.",
  ],
  modeledExclusions: [
    "Employer work-injury, sick-leave, maternity-leave, and employer old-age/social-protection shares are not deducted from employee take-home pay.",
    "GCC cross-border social insurance, employee responsibility for short-paid host-country employer shares, in-kind benefits, and business or self-employment income tax require separate facts before they can be shown as salary controls.",
  ],
  sourceUrls: [...OM_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"OM">;
