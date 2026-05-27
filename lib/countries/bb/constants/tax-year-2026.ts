import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BBCalculatorInputs } from "../types";

export const BB_TAX_YEAR = 2026;

export const BB_PERSONAL_ALLOWANCE = 25000;
export const BB_PENSIONER_ALLOWANCE = 40000;
export const BB_SPOUSE_ALLOWANCE = 3000;
export const BB_MEDICAL_EXAM_LIMIT = 750;
export const BB_UNION_SUBSCRIPTION_LIMIT = 240;
export const BB_RENEWABLE_ENERGY_DEDUCTION_LIMIT = 10000;
export const BB_REGISTERED_CHARITY_RATE_LIMIT = 0.1;
export const BB_NIS_MONTHLY_CAP_2026 = 5360;
export const BB_NIS_EMPLOYEE_RATE = 0.11;
export const BB_RESILIENCE_FUND_RATE = 0.0025;

export const BB_SOURCE_URLS = [
  "https://bra.gov.bb/attachment?file=Attachments%2FPolicy+Note+2026_Reduction+in+Personal+Income+Tax+Rates_April+2026.pdf&name=Policy+Note+2026_Reduction+in+Personal+Income+Tax+Rates_April+2026",
  "https://bra.gov.bb/attachment?file=Attachments%2FPolicy+Note+2026_Compensatory+Income+Credit.pdf&name=Compensatory+Income+Credit+%28CIC%29+%E2%80%93+Increase+in+Income+Limit",
  "https://bra.gov.bb/Popular-Topics/Employing-People/Guide-to-PAYE",
  "https://bra.gov.bb/FAQs/Income-Tax/",
  "https://bra.gov.bb/Popular-Topics/Employed-Retired-Persons/Pensions-Tax",
  "https://bra.gov.bb/attachment?file=Attachments%2FHow+to+file+your+Income+Tax+Return+2025.pdf&name=How+to+file+your+Income+Tax+Return+2025",
  "https://www.nis.gov.bb/increase-in-earnings-ceiling-2026/",
  "https://taxsummaries.pwc.com/barbados/individual/deductions",
  "https://taxsummaries.pwc.com/barbados/individual/other-taxes",
] as const;

function asBBInputs(inputs?: unknown): Partial<BBCalculatorInputs> {
  return (inputs ?? {}) as Partial<BBCalculatorInputs>;
}

function isResident(inputs?: unknown): boolean {
  return asBBInputs(inputs).residencyStatus !== "nonResident";
}

function calculatePersonalAllowance(inputs?: unknown): number {
  if (!isResident(inputs)) {
    return 0;
  }

  return asBBInputs(inputs).ageAllowanceStatus === "pensioner60Plus"
    ? BB_PENSIONER_ALLOWANCE
    : BB_PERSONAL_ALLOWANCE;
}

function calculateCharityLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  if (!isResident(inputs)) {
    return 0;
  }

  return asBBInputs(inputs).charityType === "exemptCharity"
    ? grossSalary
    : grossSalary * BB_REGISTERED_CHARITY_RATE_LIMIT;
}

export const BB_TAX_CONFIG = {
  code: "BB",
  currency: "BBD",
  taxYear: BB_TAX_YEAR,
  defaultSalary: 90000,
  incomeTaxName: "Personal income tax",
  personalAllowance: BB_PERSONAL_ALLOWANCE,
  resolvePersonalAllowance: ({ inputs }) => calculatePersonalAllowance(inputs),
  deductions: [
    {
      name: "Spouse allowance",
      calculateAmount: ({ inputs }) =>
        isResident(inputs) && asBBInputs(inputs).hasEligibleSpouse
          ? BB_SPOUSE_ALLOWANCE
          : 0,
    },
  ],
  taxCredits: [
    {
      name: "Compensatory income credit",
      calculate: ({ grossSalary, grossIncomeTax, inputs }) =>
        isResident(inputs) &&
        grossSalary > BB_PERSONAL_ALLOWANCE &&
        grossSalary <= 50000
          ? grossIncomeTax
          : 0,
    },
  ],
  brackets: [
    { min: 0, max: 50000, rate: 0.115 },
    { min: 50000, max: Infinity, rate: 0.275 },
  ],
  socialContributions: [
    {
      name: "National Insurance employee contribution",
      rate: BB_NIS_EMPLOYEE_RATE,
      cap: BB_NIS_MONTHLY_CAP_2026 * 12,
      preTax: true,
    },
    {
      name: "Resilience and Regeneration Fund contribution",
      rate: BB_RESILIENCE_FUND_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "medicalExpenses",
      name: "Annual medical examination",
      calculateLimit: ({ inputs }) =>
        isResident(inputs) &&
        asBBInputs(inputs).ageAllowanceStatus !== "standard"
          ? BB_MEDICAL_EXAM_LIMIT
          : 0,
      description:
        "Annual medical examination deduction for residents age 40 or over, capped at BBD 750.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Trade union or statutory association dues",
      calculateLimit: ({ inputs }) =>
        isResident(inputs) ? BB_UNION_SUBSCRIPTION_LIMIT : 0,
      description:
        "Subscriptions to a registered trade union or statutory association, capped at BBD 240 per year.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Charitable donations",
      calculateLimit: calculateCharityLimit,
      description:
        "Resident charitable donations. Registered non-exempt charities are capped here at 10% of salary; exempt charities are modeled up to salary.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "housingExpenses",
      name: "Energy conservation or renewable energy deduction",
      calculateLimit: ({ inputs }) =>
        isResident(inputs) ? BB_RENEWABLE_ENERGY_DEDUCTION_LIMIT : 0,
      description:
        "Modeled annual deduction for qualifying energy conservation or renewable energy system claims, capped at BBD 10,000.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Resident employment salary is modeled with the BBD 25,000 personal allowance, or BBD 40,000 where the user selects the age-60-plus pensioner allowance, and the Barbados Revenue Authority 2026 reduced PIT rates.",
    "Non-resident mode removes personal allowances and resident deductions while keeping Barbados-source salary in the same resident PIT rate structure.",
    "Spouse allowance is modeled when the spouse has no income, or investment income not over BBD 800, and no reverse tax credit claim.",
    "The compensatory income credit is modeled for resident employee income above BBD 25,000 and up to BBD 50,000.",
    "National Insurance uses the 2026 BBD 5,360 monthly insurable earnings ceiling, and the Resilience and Regeneration Fund is modeled separately at 0.25% of gross earnings.",
    "Medical examination, trade union/statutory association dues, charity, and energy conservation or renewable energy claims are modeled as annual-return deductions only; they do not reduce payroll cash salary.",
  ],
  modeledExclusions: [
    "Donations over BBD 1 million, five-year donation spreading, bonus-to-employer-shares deductions, renewable-energy training claims, domestic-worker NIS claims, foreign currency earnings allowances, special international financial services employee concessions, and employer-side charges are not modeled.",
  ],
  sourceUrls: [...BB_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BB">;
