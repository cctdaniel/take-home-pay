import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  QAContributionSalaryCapTreatment,
  QACalculatorInputs,
} from "../types";

export const QA_TAX_YEAR = 2026;

export const QA_SOURCE_URLS = [
  "https://www.gta.gov.qa/en/taxes-info",
  "https://www.gta.gov.qa/en/laws",
  "https://www.almeezan.qa/LawArticles.aspx?LawArticleID=83563&LawID=8932&language=ar",
  "https://almeezan.qa/LawView.aspx?LawID=9861&language=ar&opt=",
  "https://qna.org.qa/en/news/news-details?date=27%2F12%2F2022&id=0050-grsia-set-to-enforce-social-security-law-starting-from-january-3",
  "https://www.issa.int/sites/default/files/documents/2025-10/Qatar.pdf",
  "https://taxsummaries.pwc.com/qatar/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/qatar/individual/other-taxes",
] as const;

const QA_MONTHS_PER_YEAR = 12;
export const QA_PENSION_EMPLOYEE_RATE = 0.07;
export const QA_PENSION_EMPLOYER_RATE = 0.14;
export const QA_PENSION_MONTHLY_SALARY_CAP = 100000;
export const QA_PENSION_ANNUAL_SALARY_CAP =
  QA_PENSION_MONTHLY_SALARY_CAP * QA_MONTHS_PER_YEAR;
export const QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP = 6000;

export interface QatarGRSIAContributionSalaryComponentsMonthly {
  basicSalary: number;
  socialAllowance: number;
  housingAllowance: number;
  selectedSalary: number;
  cappedContributionSalary: number;
  salaryCap: number;
  capApplied: boolean;
}

function asQAInputs(inputs?: unknown): Partial<QACalculatorInputs> {
  return (inputs ?? {}) as Partial<QACalculatorInputs>;
}

function getContributionSalaryCapTreatment(
  inputs?: unknown,
): QAContributionSalaryCapTreatment {
  return asQAInputs(inputs).contributionSalaryCapTreatment === "grandfathered"
    ? "grandfathered"
    : "standardCap";
}

function clampCurrencyAmount(value: number, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), max);
}

function getMonthlyContributionSalaryCap({
  grossSalary,
  capTreatment,
}: {
  grossSalary: number;
  capTreatment: QAContributionSalaryCapTreatment;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const monthlyCashGross = Math.max(0, grossSalary) / QA_MONTHS_PER_YEAR;

  return capTreatment === "grandfathered"
    ? monthlyCashGross
    : Math.min(monthlyCashGross, QA_PENSION_MONTHLY_SALARY_CAP);
}

export function getQatarGRSIAContributionSalaryComponentsMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: QACalculatorInputs;
}): QatarGRSIAContributionSalaryComponentsMonthly {
  const salaryCap = getMonthlyContributionSalaryCap({
    grossSalary,
    capTreatment: getContributionSalaryCapTreatment(inputs),
  });

  if (asQAInputs(inputs).employeeType !== "qatariPensionCovered") {
    return {
      basicSalary: 0,
      socialAllowance: 0,
      housingAllowance: 0,
      selectedSalary: 0,
      cappedContributionSalary: 0,
      salaryCap,
      capApplied: false,
    };
  }

  const basicSalary = clampCurrencyAmount(inputs.grsiaBasicSalaryMonthly);
  const socialAllowance = clampCurrencyAmount(inputs.grsiaSocialAllowanceMonthly);
  const housingAllowance = clampCurrencyAmount(
    inputs.grsiaHousingAllowanceMonthly,
    QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
  );
  const componentSalary = basicSalary + socialAllowance + housingAllowance;
  const legacyContributionSalary = clampCurrencyAmount(
    inputs.grsiaContributionSalaryMonthly,
  );
  const selectedSalary =
    componentSalary > 0 ? componentSalary : legacyContributionSalary;
  const cappedContributionSalary = Math.min(selectedSalary, salaryCap);

  return {
    basicSalary:
      componentSalary > 0 || legacyContributionSalary === 0
        ? basicSalary
        : legacyContributionSalary,
    socialAllowance,
    housingAllowance,
    selectedSalary,
    cappedContributionSalary,
    salaryCap,
    capApplied: selectedSalary > cappedContributionSalary,
  };
}

export function getQatarGRSIAContributionSalaryMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: QACalculatorInputs;
}): number {
  if (asQAInputs(inputs).employeeType !== "qatariPensionCovered") {
    return 0;
  }

  return getQatarGRSIAContributionSalaryComponentsMonthly({
    grossSalary,
    inputs,
  }).cappedContributionSalary;
}

export const QA_TAX_CONFIG = {
  code: "QA",
  currency: "QAR",
  taxYear: QA_TAX_YEAR,
  defaultSalary: 360000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) =>
    asQAInputs(inputs).employeeType === "qatariPensionCovered"
      ? [
          {
            name: "Qatari social insurance employee contribution",
            rate: QA_PENSION_EMPLOYEE_RATE,
            cap: QA_PENSION_ANNUAL_SALARY_CAP,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getQatarGRSIAContributionSalaryMonthly({
                grossSalary,
                inputs: contributionInputs as QACalculatorInputs,
              }) *
              QA_MONTHS_PER_YEAR *
              QA_PENSION_EMPLOYEE_RATE,
            preTax: false,
          },
        ]
      : [],
  voluntaryContributions: [],
  assumptions: [
    "Qatar does not impose income tax on employed individuals' salaries, wages, and allowances.",
    "The default model is an expatriate employee scenario with no employee-side Qatar social insurance deduction.",
    "When Qatari/GCC pension-covered employee is selected, the model deducts the 7% employee social insurance share on the GRSIA contribution salary built from monthly basic salary, social allowance, and housing allowance.",
    "The housing allowance component included in GRSIA contribution salary is capped at QAR 6,000 per month before the total salary cap is applied.",
    "The standard GRSIA contribution salary cap is QAR 100,000 per month. The grandfathered option should be used only for an insured salary above that limit that was already fixed before the new-law cap applied.",
  ],
  modeledExclusions: [
    "Employer social insurance at 14% and end-of-service gratuity funding are employer obligations, so they are shown as source-backed context rather than employee take-home deductions.",
    "Self-employment or business income is taxed under separate Qatar taxable-activity rules and is not an employment salary input.",
    "Employment benefits do not create Qatar personal income tax in this salary model; include only the official GRSIA salary components above when the employee is pension-covered.",
  ],
  sourceUrls: [...QA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"QA">;
