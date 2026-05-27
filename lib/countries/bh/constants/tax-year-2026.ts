import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BHCalculatorInputs, BHWorkerType } from "../types";

export const BH_TAX_YEAR = 2026;

export const BH_SOURCE_URLS = [
  "https://www.sio.gov.bh/en/insurance-against-unemployment",
  "https://www.sio.gov.bh/en/unemployement-ministerial-orders",
  "https://www.sio.gov.bh/en/law-no-24-of-1976",
  "https://sio.gov.bh/public/SIO_law?lawpage=37&ln=E",
  "https://www.sio.gov.bh/en/optional-insurance",
  "https://www.sio.gov.bh/en/end-of-service-benefits",
  "https://www.sio.gov.bh/en/sio-guides",
  "https://www.bahrain.bh/wps/portal/en/BNP/ServicesCatalogue/GSX-UI-PServiceDetails?psID=1695",
  "https://www.pwc.com/m1/en/tax/documents/doing-business-guides/dbibh.pdf",
  "https://taxsummaries.pwc.com/bahrain/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/bahrain/individual/other-taxes",
  "https://mercans.com/resources/statutory-alerts/tbahrain-changes-in-social-security-rates-eosb-1st-january-2026/",
] as const;

const BH_MONTHS_PER_YEAR = 12;
export const BH_LOCAL_PENSION_EMPLOYEE_RATE = 0.07;
export const BH_UNEMPLOYMENT_EMPLOYEE_RATE = 0.01;
export const BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP = 4000;

interface BHSioWageComponentsMonthly {
  monthlyCashGross: number;
  sioBasicWageMonthly: number;
  sioRecurringAllowancesMonthly: number;
  sioSelectedWageMonthly: number;
  sioContributoryWageMonthly: number;
}

function getWorkerType(inputs: BHCalculatorInputs): BHWorkerType {
  return inputs.workerType ?? "expatriate";
}

export function getBahrainSioContributoryWageMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: BHCalculatorInputs;
}): number {
  return getBahrainSioWageComponentsMonthly({
    grossSalary,
    inputs,
  }).sioContributoryWageMonthly;
}

export function getBahrainSioWageComponentsMonthly({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs: BHCalculatorInputs;
}): BHSioWageComponentsMonthly {
  if (grossSalary <= 0) {
    return {
      monthlyCashGross: 0,
      sioBasicWageMonthly: 0,
      sioRecurringAllowancesMonthly: 0,
      sioSelectedWageMonthly: 0,
      sioContributoryWageMonthly: 0,
    };
  }

  const monthlyCashGross = Math.max(0, grossSalary) / BH_MONTHS_PER_YEAR;
  const basicWageMonthly = Math.max(0, inputs.sioBasicWageMonthly ?? 0);
  const recurringAllowancesMonthly = Math.max(
    0,
    inputs.sioRecurringAllowancesMonthly ?? 0,
  );
  const legacyContributoryWageMonthly = Math.max(
    0,
    inputs.sioContributoryWageMonthly ?? 0,
  );
  const hasComponentInputs =
    basicWageMonthly > 0 || recurringAllowancesMonthly > 0;
  const selectedWageMonthly = hasComponentInputs
    ? basicWageMonthly + recurringAllowancesMonthly
    : legacyContributoryWageMonthly > 0
      ? legacyContributoryWageMonthly
      : monthlyCashGross;
  const contributoryWageMonthly = Math.min(
    selectedWageMonthly,
    monthlyCashGross,
    BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP,
  );

  return {
    monthlyCashGross,
    sioBasicWageMonthly: hasComponentInputs
      ? basicWageMonthly
      : contributoryWageMonthly,
    sioRecurringAllowancesMonthly: hasComponentInputs
      ? recurringAllowancesMonthly
      : 0,
    sioSelectedWageMonthly: selectedWageMonthly,
    sioContributoryWageMonthly: contributoryWageMonthly,
  };
}

export const BH_TAX_CONFIG = {
  code: "BH",
  currency: "BHD",
  taxYear: BH_TAX_YEAR,
  defaultSalary: 36000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: 0 }],
  resolveSocialContributions: ({ inputs }) =>
    getWorkerType(inputs as BHCalculatorInputs) === "bahraini"
      ? [
          {
            name: "Old-age, disability, and survivors insurance employee contribution",
            rate: BH_LOCAL_PENSION_EMPLOYEE_RATE,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getBahrainSioContributoryWageMonthly({
                grossSalary,
                inputs: contributionInputs as BHCalculatorInputs,
              }) *
              BH_MONTHS_PER_YEAR *
              BH_LOCAL_PENSION_EMPLOYEE_RATE,
            preTax: false,
          },
          {
            name: "Unemployment insurance employee contribution",
            rate: BH_UNEMPLOYMENT_EMPLOYEE_RATE,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getBahrainSioContributoryWageMonthly({
                grossSalary,
                inputs: contributionInputs as BHCalculatorInputs,
              }) *
              BH_MONTHS_PER_YEAR *
              BH_UNEMPLOYMENT_EMPLOYEE_RATE,
            preTax: false,
          },
        ]
      : [
          {
            name: "Unemployment insurance employee contribution",
            rate: BH_UNEMPLOYMENT_EMPLOYEE_RATE,
            calculateAmount: ({ grossSalary, inputs: contributionInputs }) =>
              getBahrainSioContributoryWageMonthly({
                grossSalary,
                inputs: contributionInputs as BHCalculatorInputs,
              }) *
              BH_MONTHS_PER_YEAR *
              BH_UNEMPLOYMENT_EMPLOYEE_RATE,
            preTax: false,
          },
        ],
  voluntaryContributions: [],
  assumptions: [
    "Bahrain has no personal income tax on ordinary employment salary.",
    "Expatriate employees default to the 1% employee unemployment insurance contribution on SIO wage components, capped at BHD 4,000 per month.",
    "Bahraini employees can be selected to include the 8% employee SIO share on SIO wage components, capped at BHD 4,000 per month: 7% pension insurance plus 1% unemployment insurance.",
  ],
  modeledExclusions: [
    "Employer SIO, work injury, end-of-service benefit funding, LMRA fees, and other employer-only costs are not deducted from employee take-home pay.",
    "GCC cross-border social insurance rules and special public-sector arrangements are not modeled.",
  ],
  sourceUrls: [...BH_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BH">;
