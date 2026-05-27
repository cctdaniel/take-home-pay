import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { BGCalculatorInputs } from "../types";

export const BG_TAX_YEAR = 2026;
export const BG_INCOME_TAX_RATE = 0.1;
export const BG_SOCIAL_HEALTH_RATE = 0.1378;
export const BG_SOCIAL_HEALTH_CAP = 28224;
export const BG_FIXED_EUR_RATE = 1.95583;
export const BG_CHILD_RELIEF_ONE_CHILD_EUR = 6000 / BG_FIXED_EUR_RATE;
export const BG_CHILD_RELIEF_TWO_CHILDREN_EUR = 12000 / BG_FIXED_EUR_RATE;
export const BG_CHILD_RELIEF_THREE_PLUS_CHILDREN_EUR = 18000 / BG_FIXED_EUR_RATE;
export const BG_DISABLED_CHILD_RELIEF_EUR = 12000 / BG_FIXED_EUR_RATE;
export const BG_REDUCED_WORKING_CAPACITY_RELIEF_EUR = 7920 / BG_FIXED_EUR_RATE;
export const BG_VOLUNTARY_SOCIAL_INSURANCE_RELIEF_RATE = 0.1;
export const BG_LIFE_HEALTH_INSURANCE_RELIEF_RATE = 0.1;
export const BG_DONATION_AGGREGATE_RELIEF_RATE = 0.65;
export const BG_DONATION_RELIEF_RATES = {
  general_5: 0.05,
  culture_15: 0.15,
  medical_50: 0.5,
} as const;

export const BG_SOURCE_URLS = [
  "https://economy-finance.ec.europa.eu/euro/eu-countries-and-euro/bulgaria-and-euro_en",
  "https://www.mi.government.bg/en/general/vaznagrajdeniya-i-osigurovki/",
  "https://nra.bg/wps/portal/nra/taxes/godishen-danak-varhu-dohdite/Danuchni_oblekchenia_za-deca",
  "https://nra.bg/wps/portal/nra/taxes/godishen-danak-varhu-dohdite/danachni-oblekcheniya",
  "https://nra.bg/wps/portal/nra/taxes/godishen-danak-varhu-dohodite-na-fizicheski-litsa",
  "https://www.minfin.bg/upload/53892/Income_Taxes_on_Natural_Persons_Act.pdf",
  "https://www.minfin.bg/upload/1912/Income_Taxes_on_Natural_Persons_Act.pdf",
] as const;

function asBGInputs(inputs?: unknown): Partial<BGCalculatorInputs> {
  return (inputs ?? {}) as Partial<BGCalculatorInputs>;
}

function getChildRelief(children: number): number {
  if (children <= 0) {
    return 0;
  }

  if (children === 1) {
    return BG_CHILD_RELIEF_ONE_CHILD_EUR;
  }

  if (children === 2) {
    return BG_CHILD_RELIEF_TWO_CHILDREN_EUR;
  }

  return BG_CHILD_RELIEF_THREE_PLUS_CHILDREN_EUR;
}

function calculateChildReliefs(inputs?: unknown): number {
  const bgInputs = asBGInputs(inputs);
  const children = Math.min(Math.max(0, bgInputs.numberOfChildren ?? 0), 10);
  const disabledChildren = Math.min(
    Math.max(0, bgInputs.numberOfDisabledChildren ?? 0),
    children,
  );

  return getChildRelief(children) + disabledChildren * BG_DISABLED_CHILD_RELIEF_EUR;
}

function calculatePersonalDisabilityRelief(inputs?: unknown): number {
  return asBGInputs(inputs).hasReducedWorkingCapacity
    ? BG_REDUCED_WORKING_CAPACITY_RELIEF_EUR
    : 0;
}

function calculateBGEmployeeSocialHealth(grossSalary: number): number {
  return Math.min(Math.max(0, grossSalary), BG_SOCIAL_HEALTH_CAP) *
    BG_SOCIAL_HEALTH_RATE;
}

function calculateArticle17EmploymentBase(grossSalary: number): number {
  return Math.max(0, grossSalary - calculateBGEmployeeSocialHealth(grossSalary));
}

function getDonationReliefRate(inputs?: unknown): number {
  const category = asBGInputs(inputs).donationReliefCategory ?? "general_5";

  return BG_DONATION_RELIEF_RATES[category] ?? BG_DONATION_RELIEF_RATES.general_5;
}

export const BG_TAX_CONFIG = {
  code: "BG",
  currency: "EUR",
  taxYear: BG_TAX_YEAR,
  defaultSalary: 36000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Child and disabled-child tax relief",
      calculateAmount: ({ inputs }) => calculateChildReliefs(inputs),
    },
    {
      name: "50%+ reduced working capacity relief",
      calculateAmount: ({ inputs }) => calculatePersonalDisabilityRelief(inputs),
    },
  ],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: BG_INCOME_TAX_RATE }],
  socialContributions: [{ name: "Employee social and health insurance", rate: BG_SOCIAL_HEALTH_RATE, cap: BG_SOCIAL_HEALTH_CAP, preTax: true }],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary Pension / Social Insurance",
      calculateLimit: ({ grossSalary }) =>
        calculateArticle17EmploymentBase(grossSalary) *
        BG_VOLUNTARY_SOCIAL_INSURANCE_RELIEF_RATE,
      description:
        "Article 19 relief for personal voluntary social insurance contributions, modeled up to 10% of the employment taxable base proxy.",
      taxTreatment: "deduction",
    },
    {
      key: "insurancePremiums",
      name: "Voluntary Health / Life Insurance",
      calculateLimit: ({ grossSalary }) =>
        calculateArticle17EmploymentBase(grossSalary) *
        BG_LIFE_HEALTH_INSURANCE_RELIEF_RATE,
      description:
        "Article 19 relief for personal voluntary health insurance and life assurance premiums, modeled up to a separate 10% cap.",
      taxTreatment: "deduction",
    },
    {
      key: "charitableDonations",
      name: "Approved Donations",
      calculateLimit: ({ grossSalary, inputs }) =>
        calculateArticle17EmploymentBase(grossSalary) *
        Math.min(getDonationReliefRate(inputs), BG_DONATION_AGGREGATE_RELIEF_RATE),
      description:
        "Article 22 donation relief. Select the donation category above: general approved organizations 5%, culture 15%, or specified medical/assisted-reproduction funds 50%; aggregate donation relief is capped at 65%.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Bulgaria is modeled in euros because Bulgaria adopted the euro on 1 January 2026.",
    "Bulgaria is modeled with its flat personal income tax rate for employment income.",
    "Employee social and health insurance is modeled using the general employee rate and a EUR 2,352 monthly contribution ceiling.",
    "Child, disabled-child, and personal reduced-working-capacity reliefs use the NRA relief amounts converted at Bulgaria's fixed EUR/BGN conversion rate.",
    "Article 19 voluntary social-insurance and health/life-insurance reliefs are modeled as separate 10% caps against the employment taxable base proxy.",
    "Article 22 donations are modeled with one selected recipient-category cap at a time; mixed-category donation stacking is not split into multiple sliders.",
    "The personal disability relief is modeled for people with 50% or more reduced working capacity.",
  ],
  modeledExclusions: [
    "Precise social insurance category splits, employer contributions, multiple donation-category stacking, and annual-return eligibility documentation checks are excluded.",
  ],
  sourceUrls: [...BG_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BG">;
