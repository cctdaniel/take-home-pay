import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type {
  TRCalculatorInputs,
  TRDisabilityDegree,
  TRDonationReliefCategory,
} from "../types";

export const TR_TAX_YEAR = 2026;

export const TR_MONTHLY_MINIMUM_WAGE = 33030;
export const TR_ANNUAL_MINIMUM_WAGE = TR_MONTHLY_MINIMUM_WAGE * 12;
export const TR_ANNUAL_MINIMUM_WAGE_TAX_BASE =
  TR_MONTHLY_MINIMUM_WAGE * 0.85 * 12;
export const TR_MONTHLY_SSI_CEILING = 297270;
export const TR_ANNUAL_SSI_CEILING = TR_MONTHLY_SSI_CEILING * 12;
export const TR_STAMP_TAX_RATE = 0.00759;
export const TR_EMPLOYEE_SSI_RATE = 0.14;
export const TR_EMPLOYEE_UNEMPLOYMENT_RATE = 0.01;
export const TR_EMPLOYEE_SOCIAL_SECURITY_RATE =
  TR_EMPLOYEE_SSI_RATE + TR_EMPLOYEE_UNEMPLOYMENT_RATE;
export const TR_INSURANCE_PREMIUM_RATE_LIMIT = 0.15;
export const TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE = 0.1;
export const TR_GENERAL_DONATION_LIMIT_RATE = 0.05;
export const TR_DISABILITY_ALLOWANCES: Record<TRDisabilityDegree, number> = {
  none: 0,
  first: 144000,
  second: 84000,
  third: 36000,
};

export const TR_SOURCE_URLS = [
  "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2Fgelir-vergisi-tarifeleri%2Fgelir-vergisi-tarifesi-2026.pdf",
  "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2FAsgariUcrettenYapilanKesintiler.pdf",
  "https://www.sgk.gov.tr/Content/Post/2e0c9e1a-2cfe-4456-af10-49d3de0c58ba/Prime-Esas-Kazanc-Miktarlari-2026-01-14-10-35-39",
  "https://www.gib.gov.tr/vergi-konulari/1_bireysel/11_ucret_geliri/11",
  "https://www.gib.gov.tr/vergi-konulari/1_bireysel/7_diger_kazanc_ve_iratlar/7",
  "https://www.pwc.com.tr/damga-vergisi-oranlari-ve-tutarlari",
] as const;

function asTRInputs(inputs?: unknown): Partial<TRCalculatorInputs> {
  return (inputs ?? {}) as Partial<TRCalculatorInputs>;
}

function getDonationReliefCategory(inputs?: unknown): TRDonationReliefCategory {
  const category = asTRInputs(inputs).donationReliefCategory;

  return category === "generalPublicBenefit" ||
    category === "fullEducationHealth"
    ? category
    : "none";
}

function getDisabilityAllowance(inputs?: unknown): number {
  return TR_DISABILITY_ALLOWANCES[asTRInputs(inputs).disabilityDegree ?? "none"];
}

export function calculateTRAnnualReturnIncomeBase(grossSalary: number): number {
  const employeeSocialSecurity =
    Math.min(Math.max(0, grossSalary), TR_ANNUAL_SSI_CEILING) *
    TR_EMPLOYEE_SOCIAL_SECURITY_RATE;

  return Math.max(0, grossSalary - employeeSocialSecurity);
}

function calculateEducationHealthLimit(grossSalary: number): number {
  return (
    calculateTRAnnualReturnIncomeBase(grossSalary) *
    TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE
  );
}

function calculateDonationLimit(grossSalary: number, inputs?: unknown): number {
  const returnIncomeBase = calculateTRAnnualReturnIncomeBase(grossSalary);

  switch (getDonationReliefCategory(inputs)) {
    case "generalPublicBenefit":
      return returnIncomeBase * TR_GENERAL_DONATION_LIMIT_RATE;
    case "fullEducationHealth":
      return returnIncomeBase;
    case "none":
      return 0;
  }
}

function calculateTaxOnMinimumWageBase(): number {
  const firstBandTax = 190000 * 0.15;
  const secondBandTax =
    Math.max(0, TR_ANNUAL_MINIMUM_WAGE_TAX_BASE - 190000) * 0.2;

  return firstBandTax + secondBandTax;
}

export const TR_TAX_CONFIG = {
  code: "TR",
  currency: "TRY",
  taxYear: TR_TAX_YEAR,
  defaultSalary: 1800000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Disability allowance",
      calculateAmount: ({ inputs }) => getDisabilityAllowance(inputs),
    },
  ],
  taxCredits: [
    {
      name: "Minimum wage income tax exemption",
      amount: calculateTaxOnMinimumWageBase(),
    },
  ],
  brackets: [
    { min: 0, max: 190000, rate: 0.15 },
    { min: 190000, max: 400000, rate: 0.2 },
    { min: 400000, max: 1500000, rate: 0.27 },
    { min: 1500000, max: 5300000, rate: 0.35 },
    { min: 5300000, max: Infinity, rate: 0.4 },
  ],
  socialContributions: [
    {
      name: "SSI employee contribution",
      rate: TR_EMPLOYEE_SSI_RATE,
      cap: TR_ANNUAL_SSI_CEILING,
      preTax: true,
    },
    {
      name: "Unemployment insurance contribution",
      rate: TR_EMPLOYEE_UNEMPLOYMENT_RATE,
      cap: TR_ANNUAL_SSI_CEILING,
      preTax: true,
    },
    {
      name: "Stamp tax",
      rate: TR_STAMP_TAX_RATE,
      exemption: TR_ANNUAL_MINIMUM_WAGE,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "insurancePremiums",
      name: "Private health, life, or personal insurance premiums",
      calculateLimit: ({ grossSalary }) =>
        Math.min(grossSalary * TR_INSURANCE_PREMIUM_RATE_LIMIT, TR_ANNUAL_MINIMUM_WAGE),
      description:
        "Modeled Turkish insurance premium deduction: up to 15% of salary and capped here at the annual gross minimum wage.",
      taxTreatment: "deduction",
    },
    {
      key: "qualifyingExpenses",
      name: "Trade union dues",
      calculateLimit: ({ grossSalary }) => grossSalary,
      description:
        "Worker or civil-servant union dues that are deductible from gross wage when documented or shown in payroll; capped here by annual salary.",
      taxTreatment: "deduction",
    },
    {
      key: "educationExpenses",
      name: "Education and health expenses",
      calculateLimit: ({ grossSalary }) =>
        calculateEducationHealthLimit(grossSalary),
      description:
        "Annual-return deduction for eligible Turkish education and health expenses for you, your spouse, or minor children, capped at 10% of the modeled declared wage income base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Donation relief",
      calculateLimit: ({ grossSalary, inputs }) =>
        calculateDonationLimit(grossSalary, inputs),
      description:
        "Select the donation category above: general public-benefit donations are capped at 5% of declared income; education/health facility and listed full-relief donations are modeled up to the declared income base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Turkey employment income uses the 2026 GIB wage-income tax brackets.",
    "Employee SSI and unemployment insurance are modeled separately with the 2026 SGK monthly ceiling annualized over 12 equal salary months.",
    "The income-tax and stamp-tax exemptions for the minimum-wage portion of wages are modeled annually.",
    "The 2026 disability allowance and documented union dues are modeled when selected or entered.",
    "Private health, life, and personal insurance premiums are modeled up to 15% of salary and the annual gross minimum wage cap.",
    "Education/health expenses and donation relief are modeled as annual-return deductions against the declared wage income base after employee SSI and unemployment insurance.",
  ],
  modeledExclusions: [
    "Month-by-month cumulative withholding timing, employer BES/state matching effects, development-priority-area donation-rate selection, sponsorship deductions, investor deductions, and remote-service business-income incentives are not modeled.",
  ],
  sourceUrls: [...TR_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"TR">;
