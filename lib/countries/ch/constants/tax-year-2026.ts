import type { StandardCountryTaxConfig } from "../../shared/standard-country";

export const CH_TAX_YEAR = 2026;

export const CH_SOURCE_URLS = [
  "https://swisstaxcalculator.estv.admin.ch/",
  "https://www.estv.admin.ch/en/tax-rates-for-direct-federal-tax",
  "https://www.estv.admin.ch/dam/de/sd-web/gnde9CmEsalK/dbst-tairfe-58c-2026-dfi.pdf",
  "https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/steuern/natuerlichepersonen/2026/est-wegleitungen-uj/305%20Wegleitung%20ZH%202026%20UJ%20bf.pdf",
  "https://www.ahv-iv.ch/de/Merkbl%C3%A4tter/Beitr%C3%A4ge-AHV-IV-EO-ALV",
  "https://www.vermoegenszentrum.ch/en/knowledge-hub/pillar-3a-maximum-amount",
] as const;

const ALV_ANNUAL_CAP = 148200;
const BVG_ENTRY_THRESHOLD = 22680;
const BVG_COORDINATION_DEDUCTION = 26460;
const BVG_MINIMUM_COORDINATED_SALARY = 3780;
const STANDARD_EMPLOYMENT_EXPENSE_MIN = 2000;
const FEDERAL_EMPLOYMENT_EXPENSE_CAP = 4000;
export const CH_PILLAR_3A_EMPLOYEE_LIMIT_2026 = 7258;
export const CH_PRIVATE_INSURANCE_DEDUCTION_LIMIT = 2900;
export const CH_PRIVATE_INSURANCE_CHILD_DEDUCTION_LIMIT = 1300;
export const CH_CHILD_DEDUCTION_AMOUNT = 9400;
export const CH_SUPPORTED_PERSON_DEDUCTION_AMOUNT = 2800;
export const CH_CHILDCARE_DEDUCTION_PER_CHILD_LIMIT = 25300;
export const CH_TRAINING_DEDUCTION_LIMIT = 12600;
const CH_DONATION_DEDUCTION_RATE_LIMIT = 0.2;

function getWholeNumberInput(value: unknown): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(Number(value))) : 0;
}

function getCHFamilyCounts(inputs?: unknown) {
  const candidate = inputs as
    | {
        numberOfChildren?: unknown;
        numberOfChildcareChildren?: unknown;
        numberOfSupportedPersons?: unknown;
      }
    | undefined;
  const numberOfChildren = getWholeNumberInput(candidate?.numberOfChildren);
  const numberOfChildcareChildren = Math.min(
    numberOfChildren,
    getWholeNumberInput(candidate?.numberOfChildcareChildren),
  );
  const numberOfSupportedPersons = getWholeNumberInput(
    candidate?.numberOfSupportedPersons,
  );

  return {
    numberOfChildren,
    numberOfChildcareChildren,
    numberOfSupportedPersons,
  };
}

export function calculateCHInsurancePremiumLimit(inputs?: unknown): number {
  const { numberOfChildren, numberOfSupportedPersons } =
    getCHFamilyCounts(inputs);

  return (
    CH_PRIVATE_INSURANCE_DEDUCTION_LIMIT +
    (numberOfChildren + numberOfSupportedPersons) *
      CH_PRIVATE_INSURANCE_CHILD_DEDUCTION_LIMIT
  );
}

function calculateCHChildcareLimit(inputs?: unknown): number {
  const { numberOfChildcareChildren } = getCHFamilyCounts(inputs);

  return numberOfChildcareChildren * CH_CHILDCARE_DEDUCTION_PER_CHILD_LIMIT;
}

function calculateAlvContribution(grossSalary: number): number {
  return Math.min(Math.max(0, grossSalary), ALV_ANNUAL_CAP) * 0.011;
}

function calculateNbuContribution(grossSalary: number): number {
  return Math.min(Math.max(0, grossSalary), ALV_ANNUAL_CAP) * 0.004;
}

function calculateBvgContribution(grossSalary: number): number {
  if (grossSalary <= BVG_ENTRY_THRESHOLD) {
    return 0;
  }

  if (grossSalary <= 85320) {
    return (
      Math.max(
        grossSalary - BVG_COORDINATION_DEDUCTION,
        BVG_MINIMUM_COORDINATED_SALARY,
      ) * 0.05
    );
  }

  return grossSalary * 0.035 + 38;
}

export const CH_TAX_CONFIG = {
  code: "CH",
  currency: "CHF",
  taxYear: CH_TAX_YEAR,
  defaultSalary: 120000,
  incomeTaxName: "Federal, canton, and Zurich city income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Standard employment expense deduction",
      rate: 0.03,
      cap: FEDERAL_EMPLOYMENT_EXPENSE_CAP,
      floor: STANDARD_EMPLOYMENT_EXPENSE_MIN,
      base: "grossMinusPreTaxMandatoryContributions",
    },
    {
      name: "Child deduction",
      calculateAmount: ({ inputs }) =>
        getCHFamilyCounts(inputs).numberOfChildren *
        CH_CHILD_DEDUCTION_AMOUNT,
    },
    {
      name: "Supported-person deduction",
      calculateAmount: ({ inputs }) =>
        getCHFamilyCounts(inputs).numberOfSupportedPersons *
        CH_SUPPORTED_PERSON_DEDUCTION_AMOUNT,
    },
  ],
  taxCredits: [],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 23971, rateBase: 0, baseTax: 0, rate: 0.047015 },
    { min: 23971, max: 41623, rateBase: 23971, baseTax: 1127, rate: 0.120439 },
    { min: 41623, max: 67927, rateBase: 41623, baseTax: 3253, rate: 0.178376 },
    { min: 67927, max: 102574, rateBase: 67927, baseTax: 7945, rate: 0.242474 },
    { min: 102574, max: 137859, rateBase: 102574, baseTax: 16346, rate: 0.292731 },
    { min: 137859, max: 174339, rateBase: 137859, baseTax: 26674, rate: 0.339035 },
    { min: 174339, max: 265539, rateBase: 174339, baseTax: 39042, rate: 0.380504 },
    { min: 265539, max: 447939, rateBase: 265539, baseTax: 73744, rate: 0.409934 },
    { min: 447939, max: Infinity, rateBase: 447939, baseTax: 148516, rate: 0.409934 },
  ],
  socialContributions: [
    {
      name: "AHV/IV/EO employee contribution",
      rate: 0.053,
      preTax: true,
    },
    {
      name: "Unemployment insurance contribution",
      rate: 0.011,
      calculateAmount: ({ grossSalary }) => calculateAlvContribution(grossSalary),
      preTax: true,
    },
    {
      name: "Non-occupational accident insurance proxy",
      rate: 0.004,
      calculateAmount: ({ grossSalary }) => calculateNbuContribution(grossSalary),
      preTax: true,
    },
    {
      name: "Occupational pension contribution proxy",
      calculateAmount: ({ grossSalary }) => calculateBvgContribution(grossSalary),
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Pillar 3a contribution",
      limit: CH_PILLAR_3A_EMPLOYEE_LIMIT_2026,
      description:
        "Modeled Swiss Pillar 3a annual deduction limit for employees with a pension fund.",
      taxTreatment: "deduction",
    },
    {
      key: "insurancePremiums",
      name: "Health/insurance premium deduction",
      calculateLimit: ({ inputs }) => calculateCHInsurancePremiumLimit(inputs),
      description:
        "Zurich 2026 private insurance and savings-interest deduction cap: CHF 2,900 for the taxpayer plus CHF 1,300 for each modeled child or supported person.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "carerWages",
      name: "Third-party childcare costs",
      calculateLimit: ({ inputs }) => calculateCHChildcareLimit(inputs),
      description:
        "Zurich 2026 third-party childcare deduction, capped at CHF 25,300 for each child you mark as needing childcare.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Professional training costs",
      limit: CH_TRAINING_DEDUCTION_LIMIT,
      description:
        "Zurich 2026 deduction for qualifying professional education, retraining, and continuing education costs.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Charitable donations",
      calculateLimit: ({ grossSalary }) =>
        Math.max(0, grossSalary) * CH_DONATION_DEDUCTION_RATE_LIMIT,
      description:
        "Modeled qualifying donations to Swiss public-benefit or public-service legal entities, capped here at 20% of gross salary as a salary-page proxy.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Switzerland is modeled as a Zurich city, no-church-tax, single resident employee benchmark because canton and commune materially change results.",
    "The income-tax curve is fitted to the official ESTV calculator's 2026 Zurich city outputs at common salary points.",
    "AHV/IV/EO is modeled at 5.3% uncapped; unemployment and non-occupational accident insurance are capped at the 2026 ALV salary ceiling.",
    "The standard employment expense deduction uses the federal minimum and cap used by the official calculator benchmark.",
    "Occupational pension is modeled with a 35-year-old employee proxy, including the BVG entry threshold and minimum coordinated salary.",
    "Zurich benchmark family, insurance, childcare, training, donation, and Pillar 3a deductions are exposed as inputs and applied to the blended Zurich benchmark taxable income.",
  ],
  modeledExclusions: [
    "Other cantons and communes, church tax, withholding tax tables, wealth tax, exact employer pension plan rates, federal-versus-cantonal deduction base differences, and expatriate rulings are not modeled in this Zurich benchmark.",
  ],
  sourceUrls: [...CH_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"CH">;
