import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { LVCalculatorInputs } from "../types";

export const LV_TAX_YEAR = 2026;
export const LV_NON_TAXABLE_MINIMUM = 6600;
export const LV_PENSIONER_NON_TAXABLE_MINIMUM = 12000;
export const LV_DEPENDENT_ALLOWANCE = 3000;
export const LV_SOCIAL_INSURANCE_RATE = 0.105;
export const LV_SOCIAL_INSURANCE_CAP = 105300;
export const LV_RETIREMENT_ABSOLUTE_LIMIT = 4000;
export const LV_RETIREMENT_RATE_LIMIT = 0.1;
export const LV_ELIGIBLE_EXPENSE_LIMIT = 600;

export const LV_SOURCE_URLS = [
  "https://www.vid.gov.lv/en/personal-income-tax",
  "https://www.fm.gov.lv/en/non-taxable-minimum-and-tax-allowances",
  "https://www.vid.gov.lv/lv/par-apgadiba-esosam-personam",
  "https://www.fm.gov.lv/en/changes-taxation-and-finances-2026",
  "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/latvia_5aa8b806.html",
  "https://taxsummaries.pwc.com/latvia/individual/deductions",
] as const;

function asLVInputs(inputs?: unknown): Partial<LVCalculatorInputs> {
  return (inputs ?? {}) as Partial<LVCalculatorInputs>;
}

function getLVPersonalAllowance(inputs?: unknown): number {
  const lvInputs = asLVInputs(inputs);

  if (!lvInputs.isPensioner) {
    return LV_NON_TAXABLE_MINIMUM;
  }

  return Math.max(
    0,
    LV_PENSIONER_NON_TAXABLE_MINIMUM -
      Math.min(
        Math.max(0, lvInputs.pensionerAllowanceUsedElsewhere ?? 0),
        LV_PENSIONER_NON_TAXABLE_MINIMUM,
      ),
  );
}

export const LV_TAX_CONFIG = {
  code: "LV",
  currency: "EUR",
  taxYear: LV_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Personal income tax",
  personalAllowance: LV_NON_TAXABLE_MINIMUM,
  resolvePersonalAllowance: ({ inputs }) => getLVPersonalAllowance(inputs),
  deductions: [
    {
      name: "Dependent allowance",
      calculateAmount: ({ inputs }) =>
        Math.min(Math.max(0, asLVInputs(inputs).numberOfDependents ?? 0), 10) *
        LV_DEPENDENT_ALLOWANCE,
    },
  ],
  taxCredits: [],
  brackets: [{ min: 0, max: LV_SOCIAL_INSURANCE_CAP, rate: 0.255 }, { min: LV_SOCIAL_INSURANCE_CAP, max: Infinity, rate: 0.33 }],
  socialContributions: [{ name: "Employee social insurance", rate: LV_SOCIAL_INSURANCE_RATE, cap: LV_SOCIAL_INSURANCE_CAP, preTax: true }],
  voluntaryContributions: [
    { key: "retirementContribution", name: "Private pension or qualifying life-insurance contribution", limit: LV_RETIREMENT_ABSOLUTE_LIMIT, limitRate: LV_RETIREMENT_RATE_LIMIT, description: "Latvian 3rd-pillar/life-insurance deduction: up to 10% of modeled salary, capped at EUR 4,000 per year.", taxTreatment: "deduction" },
    { key: "qualifyingExpenses", name: "Education, medical, and donation eligible expenses", calculateLimit: ({ grossSalary }) => Math.min(LV_ELIGIBLE_EXPENSE_LIMIT, grossSalary * 0.5), description: "VID eligible expenses for education, medical services, donations, and gifts are capped at EUR 600 per year and not more than 50% of annual taxable income; this salary model uses salary as the cap base.", taxTreatment: "deduction", cashFlowTreatment: "taxOnly" },
  ],
  assumptions: ["Latvia is modeled with 2026 resident employment PIT rates of 25.5% up to EUR 105,300 and 33% above that threshold.", "The 2026 fixed employee non-taxable minimum is modeled as EUR 550 per month (EUR 6,600 per year).", "When selected, the pensioner non-taxable minimum is modeled as EUR 1,000 per month (EUR 12,000 per year) minus any amount already applied by SSIA or another payer.", "Dependent allowance is modeled at EUR 250 per month per dependant.", "Employee social insurance is modeled at 10.5% up to the EUR 105,300 annual object, deducted before PIT.", "Private pension/life-insurance contributions are capped at the lower of 10% of modeled salary and EUR 4,000.", "Eligible education, medical, and donation expenses are modeled as annual-return tax deductions only."],
  modeledExclusions: ["Minimum social contribution rules, employer social insurance, family-member eligible-expense carry-forwards, and annual solidarity-tax reconciliation mechanics are not modeled."],
  sourceUrls: [...LV_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"LV">;
