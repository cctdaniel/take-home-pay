import type {
  StandardCountryContributionRule,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { AMCalculatorInputs } from "../types";

export const AM_TAX_YEAR = 2026;

export const AM_SOURCE_URLS = [
  "https://english.hartak.am/guides/individual-taxes/",
  "https://www.arlis.am/en/acts/216323/download/act",
  "https://www.arlis.am/documentview.aspx?docid=205620",
  "https://www.src.am/en/getNews/378",
  "https://www.src.am/en/getNews/886",
  "https://www.src.am/storage/File_Link_Uploade/1GeneralInfo_67977eccea69b.pdf",
  "https://taxsummaries.pwc.com/armenia/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/armenia/individual/other-taxes",
] as const;

const AM_INCOME_TAX_RATE = 0.2;
const MONTHS_PER_YEAR = 12;
const PENSION_MONTHLY_THRESHOLD = 500000;
const PENSION_MONTHLY_MAX_BASE = 1125000;
const HEALTH_INSURANCE_MONTHLY_THRESHOLD = 200000;
const HEALTH_INSURANCE_LOWER_MONTHLY = 4800;
const HEALTH_INSURANCE_UPPER_MONTHLY = 10800;
const HEALTH_INSURANCE_UPPER_THRESHOLD = 500000;
const STAMP_DUTY_UPPER_THRESHOLD = 1000000;
const STAMP_DUTY_LOWER_MONTHLY = 1000;
const STAMP_DUTY_UPPER_MONTHLY = 15000;
export const AM_MORTGAGE_INTEREST_REFUND_QUARTERLY_CAP = 1_500_000;
export const AM_MORTGAGE_INTEREST_REFUND_ANNUAL_CAP =
  AM_MORTGAGE_INTEREST_REFUND_QUARTERLY_CAP * 4;
export const AM_SOCIAL_EXPENSE_HEALTHCARE_ANNUAL_CAP = 50_000;
export const AM_SOCIAL_EXPENSE_EDUCATION_ANNUAL_CAP = 100_000;
export const AM_SOCIAL_EXPENSE_TOTAL_ANNUAL_CAP = 100_000;

function getMonthlySalary(grossSalary: number): number {
  return Math.max(0, grossSalary / MONTHS_PER_YEAR);
}

function calculateFundedPensionContribution(grossSalary: number): number {
  const monthlySalary = getMonthlySalary(grossSalary);

  if (monthlySalary <= PENSION_MONTHLY_THRESHOLD) {
    return monthlySalary * 0.05 * MONTHS_PER_YEAR;
  }

  const monthlyBase = Math.min(monthlySalary, PENSION_MONTHLY_MAX_BASE);
  return (monthlyBase * 0.1 - 25000) * MONTHS_PER_YEAR;
}

function calculateHealthInsuranceContribution(grossSalary: number): number {
  const monthlySalary = getMonthlySalary(grossSalary);

  if (monthlySalary <= HEALTH_INSURANCE_MONTHLY_THRESHOLD) {
    return 0;
  }

  return (
    (monthlySalary <= HEALTH_INSURANCE_UPPER_THRESHOLD
      ? HEALTH_INSURANCE_LOWER_MONTHLY
      : HEALTH_INSURANCE_UPPER_MONTHLY) * MONTHS_PER_YEAR
  );
}

function calculateStampDuty(grossSalary: number): number {
  const monthlySalary = getMonthlySalary(grossSalary);

  if (monthlySalary <= 0) {
    return 0;
  }

  return (
    (monthlySalary <= STAMP_DUTY_UPPER_THRESHOLD
      ? STAMP_DUTY_LOWER_MONTHLY
      : STAMP_DUTY_UPPER_MONTHLY) * MONTHS_PER_YEAR
  );
}

function clampAmount(value: number | undefined, max: number): number {
  return Math.min(Math.max(0, value ?? 0), Math.max(0, max));
}

function getEmploymentIncomeTaxBeforeRefunds(grossSalary: number): number {
  return Math.max(0, grossSalary * AM_INCOME_TAX_RATE);
}

function asAMInputs(inputs?: unknown): Partial<AMCalculatorInputs> {
  return (inputs ?? {}) as Partial<AMCalculatorInputs>;
}

function getMortgageRefundLimit(grossSalary: number): number {
  return Math.min(
    AM_MORTGAGE_INTEREST_REFUND_ANNUAL_CAP,
    getEmploymentIncomeTaxBeforeRefunds(grossSalary),
  );
}

function getModeledMortgageRefund(
  grossSalary: number,
  inputs?: unknown,
): number {
  const amInputs = asAMInputs(inputs);

  return clampAmount(
    amInputs.contributions?.housingExpenses,
    getMortgageRefundLimit(grossSalary),
  );
}

function getSpecializedTuitionRefundLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return Math.max(
    0,
    getEmploymentIncomeTaxBeforeRefunds(grossSalary) -
      getModeledMortgageRefund(grossSalary, inputs),
  );
}

function getModeledSpecializedTuitionRefund(
  grossSalary: number,
  inputs?: unknown,
): number {
  const amInputs = asAMInputs(inputs);

  return clampAmount(
    amInputs.contributions?.tertiaryEducationExpenses,
    getSpecializedTuitionRefundLimit({ grossSalary, inputs }),
  );
}

function getSocialExpenseRefundBase(grossSalary: number, inputs?: unknown): number {
  return Math.max(
    0,
    getEmploymentIncomeTaxBeforeRefunds(grossSalary) -
      getModeledMortgageRefund(grossSalary, inputs) -
      getModeledSpecializedTuitionRefund(grossSalary, inputs),
  );
}

function getHealthcareSocialExpenseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return Math.min(
    AM_SOCIAL_EXPENSE_HEALTHCARE_ANNUAL_CAP,
    AM_SOCIAL_EXPENSE_TOTAL_ANNUAL_CAP,
    getSocialExpenseRefundBase(grossSalary, inputs),
  );
}

function getModeledHealthcareSocialExpense(
  grossSalary: number,
  inputs?: unknown,
): number {
  const amInputs = asAMInputs(inputs);

  return clampAmount(
    amInputs.contributions?.medicalExpenses,
    getHealthcareSocialExpenseLimit({ grossSalary, inputs }),
  );
}

function getEducationSocialExpenseLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const healthcareRefund = getModeledHealthcareSocialExpense(grossSalary, inputs);

  return Math.min(
    AM_SOCIAL_EXPENSE_EDUCATION_ANNUAL_CAP,
    Math.max(0, AM_SOCIAL_EXPENSE_TOTAL_ANNUAL_CAP - healthcareRefund),
    Math.max(
      0,
      getSocialExpenseRefundBase(grossSalary, inputs) - healthcareRefund,
    ),
  );
}

export const AM_TAX_CONFIG = {
  code: "AM",
  currency: "AMD",
  taxYear: AM_TAX_YEAR,
  defaultSalary: 12000000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: AM_INCOME_TAX_RATE }],
  resolveSocialContributions: ({ inputs }) => {
    const amInputs = inputs as AMCalculatorInputs;
    const contributions: StandardCountryContributionRule[] = [];

    if (amInputs.pensionParticipation !== "not_participating") {
      contributions.push({
        name: "Funded pension employee contribution",
        rate: 0.05,
        calculateAmount: ({ grossSalary }: { grossSalary: number }) =>
          calculateFundedPensionContribution(grossSalary),
        preTax: false,
      });
    }

    if (amInputs.healthInsuranceStatus === "applies") {
      contributions.push({
        name: "Mandatory health insurance contribution",
        calculateAmount: ({ grossSalary }: { grossSalary: number }) =>
          calculateHealthInsuranceContribution(grossSalary),
        preTax: false,
      });
    }

    contributions.push({
      name: "Stamp duty",
      calculateAmount: ({ grossSalary }: { grossSalary: number }) =>
        calculateStampDuty(grossSalary),
      preTax: false,
    });

    return contributions;
  },
  voluntaryContributions: [
    {
      key: "housingExpenses",
      name: "Eligible Mortgage Interest Refund",
      calculateLimit: ({ grossSalary }) => getMortgageRefundLimit(grossSalary),
      description:
        "Article 160 refund for eligible mortgage-loan interest, modeled up to the 1.5M AMD quarterly cap and annual employment income tax.",
      taxTreatment: "credit",
      creditRate: 1,
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "tertiaryEducationExpenses",
      name: "Specialized Masters / PhD Tuition Refund",
      calculateLimit: getSpecializedTuitionRefundLimit,
      description:
        "Article 160.1 refund for eligible accredited masters, PhD, or residency-program tuition, capped here to remaining annual employment income tax after mortgage refunds.",
      taxTreatment: "credit",
      creditRate: 1,
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "medicalExpenses",
      name: "Social Expenses - Healthcare",
      calculateLimit: getHealthcareSocialExpenseLimit,
      description:
        "SRC social-expense refund for eligible healthcare or health-insurance expenses, capped at AMD 50,000 and by the AMD 100,000 combined social-expense cap.",
      taxTreatment: "credit",
      creditRate: 1,
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Social Expenses - Education",
      calculateLimit: getEducationSocialExpenseLimit,
      description:
        "SRC social-expense refund for eligible education expenses, capped at AMD 100,000 combined with healthcare social expenses and remaining income tax.",
      taxTreatment: "credit",
      creditRate: 1,
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Armenia is modeled with the flat 20% employment income tax rate on gross salary.",
    "Funded pension social contributions use the monthly statutory formula: 5% up to AMD 500,000, then 10% minus AMD 25,000, capped at the AMD 1,125,000 monthly base.",
    "The health insurance toggle models the 2026 employee medical insurance charge for salaries above AMD 200,000 per month.",
    "Stamp duty is modeled as AMD 1,000 per month up to AMD 1,000,000 monthly salary and AMD 15,000 per month above that level.",
    "Mortgage interest, specialized higher-education tuition, and social-expense refunds are modeled as income-tax credits/refunds that can reduce income tax to zero but do not reduce payroll pension, medical insurance, or stamp duty.",
  ],
  modeledExclusions: [
    "Mortgage eligibility phase-outs by property location, construction permit date, and citizenship status are not fully modeled; use the slider only when the taxpayer and property are eligible under Article 160/SRC guidance.",
    "Disability or dependent reliefs, multiple-employer annual social contribution reconciliation, self-employment rules, and investment income are not modeled.",
  ],
  sourceUrls: [...AM_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"AM">;
