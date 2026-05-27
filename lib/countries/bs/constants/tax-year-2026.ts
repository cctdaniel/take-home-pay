import type {
  StandardCountryContributionRule,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { BSCalculatorInputs } from "../types";

export const BS_TAX_YEAR = 2026;

export const BS_NIB_WEEKLY_CEILING = 810;
export const BS_NIB_HALF_WEEKLY_CEILING = BS_NIB_WEEKLY_CEILING / 2;
export const BS_NIB_STANDARD_EMPLOYEE_RATE = 0.0465;
export const BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE = 0.0415;
export const BS_NIB_EMPLOYER_ONLY_RATE = 0.02;
export const BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE = 0.113;

export const BS_SOURCE_URLS = [
  "https://www.nib-bahamas.com/_m1723/Contributions",
  "https://www.nib-bahamas.com/wp-content/uploads/2025/05/Contribution_Rates-Insurable-Ceilings-2024-FINAL-VERSION.pdf",
  "https://taxsummaries.pwc.com/bahamas/individual/taxes-on-personal-income",
] as const;

function asBSInputs(inputs?: unknown): Partial<BSCalculatorInputs> {
  return (inputs ?? {}) as Partial<BSCalculatorInputs>;
}

export function isBahamasNibEmployerOnlyCategory(inputs?: unknown): boolean {
  const nibCategory = asBSInputs(inputs).nibCategory ?? "standard";

  return (
    nibCategory === "age60to64RetirementBenefit" ||
    nibCategory === "age65PlusRetirementBenefit" ||
    nibCategory === "summerEmployment"
  );
}

export function getBahamasNibBasicWageEmployeeRate(inputs?: unknown): number {
  const nibCategory = asBSInputs(inputs).nibCategory ?? "standard";

  if (isBahamasNibEmployerOnlyCategory(inputs)) {
    return 0;
  }

  return nibCategory === "age65PlusNotRetired"
    ? BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE
    : BS_NIB_STANDARD_EMPLOYEE_RATE;
}

function getBahamasNibCategoryWeeklyCeiling(inputs?: unknown): number {
  const bsInputs = inputs as Partial<BSCalculatorInputs> | undefined;

  return bsInputs?.nibCategory === "age60to64RetirementBenefit"
    ? BS_NIB_HALF_WEEKLY_CEILING
    : BS_NIB_WEEKLY_CEILING;
}

export function getBahamasNibFormalGratuitiesWeekly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0 || isBahamasNibEmployerOnlyCategory(inputs)) {
    return 0;
  }

  const weeklyCashGross = Math.max(0, grossSalary) / 52;
  const weeklyCeiling = Math.min(
    weeklyCashGross,
    getBahamasNibCategoryWeeklyCeiling(inputs),
  );
  const enteredWeeklyGratuities = asBSInputs(inputs).weeklyFormalGratuities ?? 0;

  return Math.min(Math.max(0, enteredWeeklyGratuities), weeklyCeiling);
}

export function getBahamasNibInsurableWeeklyWage({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (grossSalary <= 0) {
    return 0;
  }

  const bsInputs = asBSInputs(inputs);
  const enteredWeeklyWage = bsInputs.nibInsurableWeeklyWage ?? 0;
  const weeklyCashGross = Math.max(0, grossSalary) / 52;
  const weeklyGratuities = getBahamasNibFormalGratuitiesWeekly({
    grossSalary,
    inputs,
  });
  const remainingCashWage = Math.max(0, weeklyCashGross - weeklyGratuities);
  const remainingNibBase = Math.max(
    0,
    getBahamasNibCategoryWeeklyCeiling(inputs) - weeklyGratuities,
  );
  const weeklyCeiling = Math.min(remainingCashWage, remainingNibBase);

  return Math.min(
    enteredWeeklyWage > 0 ? enteredWeeklyWage : weeklyCeiling,
    weeklyCeiling,
  );
}

export function getBahamasNibEmployerOnlyContributionAnnual({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (!isBahamasNibEmployerOnlyCategory(inputs)) {
    return 0;
  }

  return (
    getBahamasNibInsurableWeeklyWage({ grossSalary, inputs }) *
    52 *
    BS_NIB_EMPLOYER_ONLY_RATE
  );
}

export const BS_TAX_CONFIG = {
  code: "BS",
  currency: "BSD",
  taxYear: BS_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) => {
    const basicWageEmployeeRate = getBahamasNibBasicWageEmployeeRate(inputs);

    if (basicWageEmployeeRate <= 0) {
      return [];
    }

    const contributionRules: StandardCountryContributionRule[] = [
      {
        name: "National Insurance employee contribution - basic wage",
        rate: basicWageEmployeeRate,
        cap: BS_NIB_WEEKLY_CEILING * 52,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getBahamasNibInsurableWeeklyWage({
            grossSalary,
            inputs: contributionInputs,
          }) *
          52 *
          getBahamasNibBasicWageEmployeeRate(contributionInputs),
        preTax: false,
      },
      {
        name: "National Insurance employee contribution - formal gratuities",
        rate: BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE,
        cap: BS_NIB_WEEKLY_CEILING * 52,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getBahamasNibFormalGratuitiesWeekly({
            grossSalary,
            inputs: contributionInputs,
          }) *
          52 *
          BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE,
        preTax: false,
      },
    ];

    return contributionRules.filter((rule) => {
      if (rule.name.includes("formal gratuities")) {
        return (
          getBahamasNibFormalGratuitiesWeekly({
            grossSalary: inputs.grossSalary,
            inputs,
          }) > 0
        );
      }

      return true;
    });
  },
  voluntaryContributions: [],
  assumptions: [
    "The Bahamas has no personal income tax on ordinary employment salary in this model.",
    "National Insurance is modeled at the post-July-2024 standard employee rate of 4.65% on selected basic weekly wages up to the BSD 810 ceiling; the age 65+ not receiving Retirement Benefit category uses the 4.15% employee rate.",
    "Employees age 60-64 or 65+ receiving Retirement Benefit, and summer employment, are shown as employer-only NIB categories with 0% employee deduction and 2% employer context.",
    "Formal tips and gratuities entered separately are treated as part of gross salary and use the NIB gratuity employee rate of 11.3% up to the remaining weekly ceiling.",
  ],
  modeledExclusions: [
    "Employer National Insurance for ordinary categories is not deducted from employee take-home pay; the special employer-only categories are shown as context in the results.",
    "Business licence tax, self-employed NIB, voluntary insured-person contributions, property taxes, and stamp duties are not employee payroll deductions and require business, coverage-history, or asset facts.",
  ],
  sourceUrls: [...BS_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BS">;
