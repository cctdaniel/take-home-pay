import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  SACalculatorInputs,
  SAHousingAllowanceType,
  SAWorkerType,
} from "../types";

export const SA_TAX_YEAR = 2026;

export const SA_SOURCE_URLS = [
  "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/default.aspx",
  "https://taxsummaries.pwc.com/saudi-arabia/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/saudi-arabia/individual/other-taxes",
  "https://www.gosi.gov.sa/GOSIOnline/FAQ_Employer?locale=en_US",
  "https://misa.gov.sa/app/uploads/2025/07/Social-Insurance-Law.pdf",
] as const;

const MONTHS_PER_YEAR = 12;
export const SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_MIN = 1500;
export const SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_CAP = 45000;
export const SA_GOSI_ANNUAL_CONTRIBUTORY_WAGE_CAP =
  SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_CAP * MONTHS_PER_YEAR;
export const SA_GOSI_ANNUITIES_EMPLOYEE_RATE = 0.09;
export const SA_SANED_EMPLOYEE_RATE = 0.0075;
export const SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_JAN_JUN_2026 = 0.095;
export const SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_JUL_DEC_2026 = 0.1;
export const SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_2026 =
  (SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_JAN_JUN_2026 +
    SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_JUL_DEC_2026) /
  2;
export const SA_GOSI_IN_KIND_HOUSING_MONTHS_PER_YEAR = 2;

function getWorkerType(inputs: SACalculatorInputs): SAWorkerType {
  return inputs.workerType ?? "expatriate";
}

function isSaudiGosiCovered(workerType: SAWorkerType): boolean {
  return (
    workerType === "saudi_standard" ||
    workerType === "saudi_new_system_2026"
  );
}

function getSaudiAnnuitiesEmployeeRate(workerType: SAWorkerType): number {
  return workerType === "saudi_new_system_2026"
    ? SA_GOSI_NEW_SYSTEM_ANNUITIES_EMPLOYEE_RATE_2026
    : SA_GOSI_ANNUITIES_EMPLOYEE_RATE;
}

function clampGosiContributoryWageMonthly(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(value, SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_MIN),
    SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_CAP,
  );
}

function getHousingAllowanceType(
  inputs: SACalculatorInputs,
): SAHousingAllowanceType {
  if (
    inputs.housingAllowanceType === "cash" ||
    inputs.housingAllowanceType === "inKind"
  ) {
    return inputs.housingAllowanceType;
  }

  return "none";
}

export function getSaudiGosiWageComponentsMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: SACalculatorInputs;
}) {
  if (!isSaudiGosiCovered(getWorkerType(inputs)) || grossSalary <= 0) {
    return {
      basicWage: 0,
      housingValue: 0,
      contributoryWage: 0,
    };
  }

  const enteredBasicWage = inputs.gosiBasicWageMonthly;
  const enteredLegacyContributoryWage = inputs.gosiContributoryWageMonthly;
  const fallbackMonthlyWage = grossSalary / MONTHS_PER_YEAR;
  const basicWage =
    enteredBasicWage && enteredBasicWage > 0
      ? enteredBasicWage
      : enteredLegacyContributoryWage && enteredLegacyContributoryWage > 0
        ? enteredLegacyContributoryWage
        : fallbackMonthlyWage;
  const housingAllowanceType = getHousingAllowanceType(inputs);
  const housingValue =
    housingAllowanceType === "cash"
      ? Math.max(0, inputs.cashHousingAllowanceMonthly ?? 0)
      : housingAllowanceType === "inKind"
        ? (basicWage * SA_GOSI_IN_KIND_HOUSING_MONTHS_PER_YEAR) /
          MONTHS_PER_YEAR
        : 0;
  const contributoryWage = clampGosiContributoryWageMonthly(
    basicWage + housingValue,
  );

  return {
    basicWage,
    housingValue,
    contributoryWage,
  };
}

export function getSaudiGosiContributoryWageMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: SACalculatorInputs;
}): number {
  const components = getSaudiGosiWageComponentsMonthly({
    grossSalary,
    inputs,
  });

  return components.contributoryWage;
}

export const SA_TAX_CONFIG = {
  code: "SA",
  currency: "SAR",
  taxYear: SA_TAX_YEAR,
  defaultSalary: 360000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) => {
    const workerType = getWorkerType(inputs as SACalculatorInputs);

    if (!isSaudiGosiCovered(workerType)) {
      return [];
    }

    const annuitiesEmployeeRate = getSaudiAnnuitiesEmployeeRate(workerType);
    const annuitiesContributionName =
      workerType === "saudi_new_system_2026"
        ? "New-system GOSI annuities employee contribution (2026 blended)"
        : "GOSI annuities employee contribution";

    return [
      {
        name: annuitiesContributionName,
        rate: annuitiesEmployeeRate,
        cap: SA_GOSI_ANNUAL_CONTRIBUTORY_WAGE_CAP,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getSaudiGosiContributoryWageMonthly({
            grossSalary,
            inputs: contributionInputs as SACalculatorInputs,
          }) *
          MONTHS_PER_YEAR *
          annuitiesEmployeeRate,
        preTax: false,
      },
      {
        name: "SANED unemployment insurance employee contribution",
        rate: SA_SANED_EMPLOYEE_RATE,
        cap: SA_GOSI_ANNUAL_CONTRIBUTORY_WAGE_CAP,
        calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
          getSaudiGosiContributoryWageMonthly({
            grossSalary,
            inputs: contributionInputs as SACalculatorInputs,
          }) *
          MONTHS_PER_YEAR *
          SA_SANED_EMPLOYEE_RATE,
        preTax: false,
      },
    ];
  },
  voluntaryContributions: [],
  assumptions: [
    "Saudi Arabia does not impose income tax on earnings derived only from employment in Saudi Arabia.",
    "Expatriate employees default to no employee-side GOSI deduction; non-Saudi occupational hazard coverage is employer-paid.",
    "Saudi employees can be selected under the existing system or the 2026 new-system phase-in. Existing-system Saudi employees use 9% GOSI annuities plus 0.75% SANED; new-system 2026 contributors use a blended 9.75% annuities rate plus 0.75% SANED, reflecting 9.5% from January-June and 10% from July-December.",
    "The new-system option applies the 2024 Social Insurance Law phase-in for new employees with no prior civil pension or social insurance contribution periods.",
    "Saudi employee contribution bases are built from basic wage plus cash housing allowance, or in-kind housing valued at two months of basic wage per year, then subject to the SAR 1,500 minimum and SAR 45,000 maximum.",
  ],
  modeledExclusions: [
    "GCC home-country social insurance, employer-only occupational hazard contributions, dependent fees, benefits, and business income/zakat are excluded.",
  ],
  sourceUrls: [...SA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"SA">;
