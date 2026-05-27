import type {
  StandardCountryContributionRule,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { RWCalculatorInputs } from "../types";

export const RW_TAX_YEAR = 2026;

export const RW_SOURCE_URLS = [
  "https://www.rra.gov.rw/en/domestic-tax-services/employment-tax-paye/calculate-paye",
  "https://www.rra.gov.rw/en/home?cHash=274ebd079db0481bcee1523bae97e29d&tx_news_pi1%5Baction%5D=detail&tx_news_pi1%5Bcontroller%5D=News&tx_news_pi1%5Bnews%5D=2223",
  "https://www.rra.gov.rw/en/domestic-tax-services/rssb-contributions/pension-scheme-contribution",
  "https://www.rra.gov.rw/en/domestic-tax-services/rssb-contributions/maternity-leave-contribution",
  "https://www.rra.gov.rw/en/domestic-tax-services/rssb-contributions/medical-scheme-contribution",
  "https://www.rra.gov.rw/en/domestic-tax-services/rssb-contributions/cbhi-contribution",
  "https://imisanzu.rssb.rw/contribution-services/share-info",
  "https://www.rssb.rw/scheme/maternity-leave",
  "https://www.rssb.rw/scheme/medical-scheme",
  "https://taxsummaries.pwc.com/rwanda/individual/sample-personal-income-tax-calculation",
  "https://taxsummaries.pwc.com/rwanda/individual/income-determination",
  "https://taxsummaries.pwc.com/rwanda/individual/deductions",
  "https://www.rssb.rw/scheme/ejo-heza",
] as const;

export const RW_PENSION_EMPLOYEE_RATE = 0.06;
export const RW_PENSION_VOLUNTARY_MEMBER_RATE = 0.12;
export const RW_MATERNITY_EMPLOYEE_RATE = 0.003;
export const RW_MEDICAL_SCHEME_EMPLOYEE_RATE = 0.075;
export const RW_CBHI_NET_SALARY_RATE = 0.005;
export const RW_HOUSING_BENEFIT_RATE = 0.2;
export const RW_MOTOR_VEHICLE_BENEFIT_RATE = 0.1;
export const RW_MONTHS_PER_YEAR = 12;

function asRWInputs(inputs?: unknown): Partial<RWCalculatorInputs> {
  return (inputs ?? {}) as Partial<RWCalculatorInputs>;
}

export function getRwandaRssbContributionSalaryMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const rwInputs = asRWInputs(inputs);
  const monthlyCashSalary = Math.max(0, grossSalary) / RW_MONTHS_PER_YEAR;
  const enteredSalary = rwInputs.rssbContributionSalaryMonthly ?? 0;

  return Math.min(
    enteredSalary > 0 ? enteredSalary : monthlyCashSalary,
    monthlyCashSalary,
  );
}

export function getRwandaRssbMedicalBasicSalaryMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0 || asRWInputs(inputs).rssbMedicalSchemeCovered !== true) {
    return 0;
  }

  const monthlyCashSalary = Math.max(0, grossSalary) / RW_MONTHS_PER_YEAR;
  const enteredSalary = asRWInputs(inputs).rssbMedicalBasicSalaryMonthly ?? 0;

  return Math.min(
    enteredSalary > 0 ? enteredSalary : monthlyCashSalary,
    monthlyCashSalary,
  );
}

export const RW_TAX_CONFIG = {
  code: "RW",
  currency: "RWF",
  taxYear: RW_TAX_YEAR,
  defaultSalary: 36000000,
  incomeTaxName: "PAYE income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [
    { min: 0, max: 720000, rate: 0 },
    { min: 720000, max: 1200000, rate: 0.1 },
    { min: 1200000, max: 2400000, rate: 0.2 },
    { min: 2400000, max: Infinity, rate: 0.3 },
  ],
  resolveSocialContributions: ({ inputs }) => {
    const rwInputs = asRWInputs(inputs);
    const pensionRate =
      rwInputs.pensionCoverage === "voluntaryMember"
        ? RW_PENSION_VOLUNTARY_MEMBER_RATE
        : RW_PENSION_EMPLOYEE_RATE;

    return [
      {
        name:
          rwInputs.pensionCoverage === "voluntaryMember"
            ? "RSSB voluntary pension member contribution"
            : "RSSB pension employee contribution",
        rate: pensionRate,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getRwandaRssbContributionSalaryMonthly({
            grossSalary,
            inputs: contributionInputs,
          }) *
          RW_MONTHS_PER_YEAR *
          pensionRate,
        preTax: false,
      },
      {
        name: "RSSB maternity leave contribution",
        rate: RW_MATERNITY_EMPLOYEE_RATE,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getRwandaRssbContributionSalaryMonthly({
            grossSalary,
            inputs: contributionInputs,
          }) *
          RW_MONTHS_PER_YEAR *
          RW_MATERNITY_EMPLOYEE_RATE,
        preTax: false,
      },
      ...(rwInputs.rssbMedicalSchemeCovered
        ? ([
            {
              name: "RSSB medical scheme employee contribution",
              rate: RW_MEDICAL_SCHEME_EMPLOYEE_RATE,
              calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
                getRwandaRssbMedicalBasicSalaryMonthly({
                  grossSalary,
                  inputs: contributionInputs,
                }) *
                RW_MONTHS_PER_YEAR *
                RW_MEDICAL_SCHEME_EMPLOYEE_RATE,
              preTax: false,
            },
          ] satisfies StandardCountryContributionRule[])
        : []),
    ];
  },
  postTaxSocialContributions: [
    {
      name: "CBHI health contribution",
      rate: RW_CBHI_NET_SALARY_RATE,
      calculateAmount: ({ grossSalary, incomeTax, priorContributions }) =>
        Math.max(
          0,
          grossSalary -
            incomeTax -
            priorContributions.reduce(
              (sum, contribution) => sum + contribution.amount,
              0,
            ),
        ) * RW_CBHI_NET_SALARY_RATE,
    },
  ],
  voluntaryContributions: [],
  assumptions: [
    "Rwanda PAYE monthly brackets are annualized for a full-year employee.",
    "RSSB pension is modeled at 6% for ordinary employee coverage or 12% when voluntary pension member coverage is selected.",
    "RSSB pension and maternity leave contributions are modeled on the selected RSSB contribution salary. Pension is 6% for ordinary employee coverage or 12% for voluntary pension members, and maternity leave is the 0.3% employee share.",
    "RSSB medical scheme coverage is optional in this model; when selected, the 7.5% employee share is applied to the selected medical basic salary.",
    "CBHI is modeled at 0.5% of net salary after PAYE, pension, and maternity deductions.",
    "Rwanda benefits in kind are modeled as taxable employment income: accommodation at 20% of cash employment income, motor vehicle access at 10%, plus any other entered taxable benefit value.",
  ],
  modeledExclusions: [
    "Employer-only contributions, occupational hazards, employer basic-salary splits, EjoHeza voluntary savings, and detailed loan-benefit interest calculations require employer, account, benefit-valuation, or loan details before they can be shown as salary controls.",
    "EjoHeza and similar savings are not exposed as annual deduction sliders because Rwanda has no general personal deductions and RSSB contributions are modeled after PIT.",
  ],
  sourceUrls: [...RW_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"RW">;
