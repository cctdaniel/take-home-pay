import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { KWCalculatorInputs, KWSector, KWWorkerType } from "../types";

export const KW_TAX_YEAR = 2026;

export const KW_SOURCE_URLS = [
  "https://www.mof.gov.kw/",
  "https://www.pifss.gov.kw/",
  "https://www.pifss.gov.kw/sites/En/Pages/PensionSocialSecuritySector/FAQ.aspx",
  "https://taxsummaries.pwc.com/kuwait/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/kuwait/individual/other-taxes",
] as const;

const MONTHS_PER_YEAR = 12;
export const KW_BASIC_PIFSS_MONTHLY_CAP = 1500;
export const KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP = 1250;
export const KW_PENSION_INCREASE_MONTHLY_CAP = 2750;
export const KW_FINANCIAL_REMUNERATION_MONTHLY_CAP = 1500;
export const KW_UNEMPLOYMENT_INSURANCE_MONTHLY_CAP = 2750;
export const KW_BASIC_PIFSS_EMPLOYEE_RATE = 0.05;
export const KW_SUPPLEMENTARY_PIFSS_EMPLOYEE_RATE = 0.05;
export const KW_PENSION_INCREASE_EMPLOYEE_RATE = 0.025;
export const KW_FINANCIAL_REMUNERATION_EMPLOYEE_RATE = 0.025;
export const KW_UNEMPLOYMENT_EMPLOYEE_RATE = 0.005;

function getWorkerType(inputs: KWCalculatorInputs): KWWorkerType {
  return inputs.workerType ?? "expatriate";
}

function getSector(inputs: KWCalculatorInputs): KWSector {
  return inputs.sector === "privateOil" ? "privateOil" : "government";
}

function clampMonthly(value: number, cap: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(value, cap);
}

export function getKuwaitPifssSalaryBasesMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: KWCalculatorInputs;
}) {
  if (getWorkerType(inputs) !== "kuwaiti" || grossSalary <= 0) {
    return {
      basic: 0,
      supplementary: 0,
      pensionIncrease: 0,
      financialRemuneration: 0,
      unemployment: 0,
      total: 0,
    };
  }

  const enteredBasicSalary = inputs.pifssBasicSalaryMonthly;
  const enteredSupplementarySalary = inputs.pifssSupplementarySalaryMonthly;
  const enteredLegacyCombinedSalary = inputs.pifssInsurableSalaryMonthly;
  const fallbackMonthlySalary = grossSalary / MONTHS_PER_YEAR;
  const combinedMonthlySalary =
    enteredLegacyCombinedSalary && enteredLegacyCombinedSalary > 0
      ? enteredLegacyCombinedSalary
      : fallbackMonthlySalary;
  const basic = clampMonthly(
    enteredBasicSalary && enteredBasicSalary > 0
      ? enteredBasicSalary
      : Math.min(combinedMonthlySalary, KW_BASIC_PIFSS_MONTHLY_CAP),
    KW_BASIC_PIFSS_MONTHLY_CAP,
  );
  const supplementary = clampMonthly(
    enteredSupplementarySalary && enteredSupplementarySalary > 0
      ? enteredSupplementarySalary
      : Math.max(0, combinedMonthlySalary - basic),
    KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP,
  );
  const total = basic + supplementary;
  const pensionIncrease = Math.min(total, KW_PENSION_INCREASE_MONTHLY_CAP);
  const financialRemuneration = inputs.includeFinancialRemuneration
    ? Math.min(basic, KW_FINANCIAL_REMUNERATION_MONTHLY_CAP)
    : 0;
  const unemployment =
    getSector(inputs) === "privateOil"
      ? Math.min(total, KW_UNEMPLOYMENT_INSURANCE_MONTHLY_CAP)
      : 0;

  return {
    basic,
    supplementary,
    pensionIncrease,
    financialRemuneration,
    unemployment,
    total,
  };
}

export function getKuwaitPifssInsurableSalaryMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: KWCalculatorInputs;
}): number {
  return getKuwaitPifssSalaryBasesMonthly({ grossSalary, inputs }).total;
}

export const KW_TAX_CONFIG = {
  code: "KW",
  currency: "KWD",
  taxYear: KW_TAX_YEAR,
  defaultSalary: 30000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) =>
    getWorkerType(inputs as KWCalculatorInputs) === "kuwaiti"
      ? [
          {
            name: "Basic insurance employee contribution",
            rate: KW_BASIC_PIFSS_EMPLOYEE_RATE,
            cap: KW_BASIC_PIFSS_MONTHLY_CAP * MONTHS_PER_YEAR,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getKuwaitPifssSalaryBasesMonthly({
                grossSalary,
                inputs: contributionInputs as KWCalculatorInputs,
              }).basic *
              MONTHS_PER_YEAR *
              KW_BASIC_PIFSS_EMPLOYEE_RATE,
            preTax: false,
          },
          {
            name: "Supplementary insurance employee contribution",
            rate: KW_SUPPLEMENTARY_PIFSS_EMPLOYEE_RATE,
            cap: KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP * MONTHS_PER_YEAR,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getKuwaitPifssSalaryBasesMonthly({
                grossSalary,
                inputs: contributionInputs as KWCalculatorInputs,
              }).supplementary *
              MONTHS_PER_YEAR *
              KW_SUPPLEMENTARY_PIFSS_EMPLOYEE_RATE,
            preTax: false,
          },
          {
            name: "Pension increase employee contribution",
            rate: KW_PENSION_INCREASE_EMPLOYEE_RATE,
            cap: KW_PENSION_INCREASE_MONTHLY_CAP * MONTHS_PER_YEAR,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getKuwaitPifssSalaryBasesMonthly({
                grossSalary,
                inputs: contributionInputs as KWCalculatorInputs,
              }).pensionIncrease *
              MONTHS_PER_YEAR *
              KW_PENSION_INCREASE_EMPLOYEE_RATE,
            preTax: false,
          },
          ...((inputs as KWCalculatorInputs).includeFinancialRemuneration
            ? [
                {
                  name: "Financial remuneration employee contribution",
                  rate: KW_FINANCIAL_REMUNERATION_EMPLOYEE_RATE,
                  cap:
                    KW_FINANCIAL_REMUNERATION_MONTHLY_CAP * MONTHS_PER_YEAR,
                  calculateAmount: ({
                    grossSalary,
                    inputs: contributionInputs,
                  }: {
                    grossSalary: number;
                    inputs: unknown;
                  }) =>
                    getKuwaitPifssSalaryBasesMonthly({
                      grossSalary,
                      inputs: contributionInputs as KWCalculatorInputs,
                    }).financialRemuneration *
                    MONTHS_PER_YEAR *
                    KW_FINANCIAL_REMUNERATION_EMPLOYEE_RATE,
                  preTax: false,
                },
              ]
            : []),
          ...(getSector(inputs as KWCalculatorInputs) === "privateOil"
            ? [
                {
                  name: "Unemployment insurance employee contribution",
                  rate: KW_UNEMPLOYMENT_EMPLOYEE_RATE,
                  cap:
                    KW_UNEMPLOYMENT_INSURANCE_MONTHLY_CAP * MONTHS_PER_YEAR,
                  calculateAmount: ({
                    grossSalary,
                    inputs: contributionInputs,
                  }: {
                    grossSalary: number;
                    inputs: unknown;
                  }) =>
                    getKuwaitPifssSalaryBasesMonthly({
                      grossSalary,
                      inputs: contributionInputs as KWCalculatorInputs,
                    }).unemployment *
                    MONTHS_PER_YEAR *
                    KW_UNEMPLOYMENT_EMPLOYEE_RATE,
                  preTax: false,
                },
              ]
            : []),
        ]
      : [],
  voluntaryContributions: [],
  assumptions: [
    "Kuwait has no personal income tax on ordinary employment salary.",
    "Expatriate employees default to no local employee social security deduction.",
    "Kuwaiti employees can be selected to include official PIFSS employee contribution lines: 5% basic insurance up to KWD 1,500 per month, 5% supplementary insurance up to KWD 1,250 per month, 2.5% pension increase up to KWD 2,750 per month, optional/conditional 2.5% financial remuneration up to KWD 1,500 per month, and 0.5% unemployment insurance for private/oil-sector employees up to KWD 2,750 per month.",
  ],
  modeledExclusions: [
    "Employer social security, GCC cross-border social insurance, self-employed Chapter Five brackets, conjoining nominal contribution periods, terminal indemnity funding, employer benefits, and corporate/business tax are excluded.",
  ],
  sourceUrls: [...KW_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"KW">;
