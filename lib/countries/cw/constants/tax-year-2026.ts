import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { CWCalculatorInputs } from "../types";

export const CW_TAX_YEAR = 2026;

export const CW_SOURCE_URLS = [
  "https://belastingdienst.cw/wp-content/uploads/2026/01/Schijven-tarief-2026.pdf",
  "https://belastingdienst.cw/wp-content/uploads/2026/01/Loonbelastingverklaring-2026.pdf",
  "https://belastingdienst.cw/wp-content/uploads/2026/01/Loonbelastingverklaring-2026-toelichting.docx-1.pdf",
  "https://belastingdienst.cw/aangifte-betaling/loonbelasting/werknemer/werknemer-in-dienst/",
  "https://svbcur.org/premiepercentages-loongrenzen/",
  "https://taxsummaries.pwc.com/curacao/individual/taxes-on-personal-income",
] as const;

export const CW_BASIC_TAX_CREDIT = 2915;
export const CW_SINGLE_EARNER_ALLOWANCE = 1779;
export const CW_ELDERLY_ALLOWANCE = 1342;
export const CW_TRANSFERRED_ELDERLY_ALLOWANCE = 673;
export const CW_CHILD_ALLOWANCE_CATEGORY_I = 948;
export const CW_CHILD_ALLOWANCE_CATEGORY_II = 475;
export const CW_CHILD_ALLOWANCE_CATEGORY_III = 124;
export const CW_CHILD_ALLOWANCE_CATEGORY_IV = 96;

function asCWInputs(inputs?: unknown): Partial<CWCalculatorInputs> {
  return (inputs ?? {}) as Partial<CWCalculatorInputs>;
}

function isResident(inputs?: unknown): boolean {
  return (asCWInputs(inputs).taxResidency ?? "resident") === "resident";
}

function calculateChildAllowance(inputs?: unknown): number {
  const cwInputs = asCWInputs(inputs);

  return (
    Math.max(0, Math.floor(cwInputs.childAllowanceCategoryI ?? 0)) *
      CW_CHILD_ALLOWANCE_CATEGORY_I +
    Math.max(0, Math.floor(cwInputs.childAllowanceCategoryII ?? 0)) *
      CW_CHILD_ALLOWANCE_CATEGORY_II +
    Math.max(0, Math.floor(cwInputs.childAllowanceCategoryIII ?? 0)) *
      CW_CHILD_ALLOWANCE_CATEGORY_III +
    Math.max(0, Math.floor(cwInputs.childAllowanceCategoryIV ?? 0)) *
      CW_CHILD_ALLOWANCE_CATEGORY_IV
  );
}

export const CW_TAX_CONFIG = {
  code: "CW",
  currency: "ANG",
  taxYear: CW_TAX_YEAR,
  defaultSalary: 90000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [{ name: "Fixed employment expense deduction", amount: 500 }],
  taxCredits: [
    {
      name: "Basic tax credit",
      calculate: ({ inputs }) =>
        isResident(inputs) ? CW_BASIC_TAX_CREDIT : 0,
    },
    {
      name: "Single-earner allowance",
      calculate: ({ inputs }) =>
        isResident(inputs) && asCWInputs(inputs).isMarriedSingleEarner
          ? CW_SINGLE_EARNER_ALLOWANCE
          : 0,
    },
    {
      name: "Child allowance",
      calculate: ({ inputs }) =>
        isResident(inputs) ? calculateChildAllowance(inputs) : 0,
    },
    {
      name: "Elderly allowance",
      calculate: ({ inputs }) =>
        isResident(inputs) && asCWInputs(inputs).isAge60OrOlder
          ? CW_ELDERLY_ALLOWANCE
          : 0,
    },
    {
      name: "Transferred elderly allowance",
      calculate: ({ inputs }) =>
        isResident(inputs) && asCWInputs(inputs).hasTransferredElderlyAllowance
          ? CW_TRANSFERRED_ELDERLY_ALLOWANCE
          : 0,
    },
  ],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 40782, rate: 0.0975, rateBase: 0 },
    { min: 40782, max: 54399, rate: 0.15, baseTax: 3976, rateBase: 40782 },
    { min: 54399, max: 81597, rate: 0.23, baseTax: 6018, rateBase: 54399 },
    { min: 81597, max: 108794, rate: 0.3, baseTax: 12273, rateBase: 81597 },
    { min: 108794, max: 163191, rate: 0.375, baseTax: 20432, rateBase: 108794 },
    { min: 163191, max: Infinity, rate: 0.465, baseTax: 40831, rateBase: 163191 },
  ],
  resolveSocialContributions: ({ inputs }) =>
    isResident(inputs)
      ? [
          {
            name: "AOV/AWW old-age and widows/orphans premiums",
            rate: 0.065,
            cap: 100000,
            preTax: true,
          },
          {
            name: "BVZ basic health insurance premium",
            rate: 0.043,
            cap: 150000,
            preTax: false,
          },
          {
            name: "AVBZ long-term care premium",
            rate: 0.02,
            cap: 606247.08,
            preTax: false,
          },
        ]
      : [],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Savings or provident fund contribution",
      limit: 840,
      description:
        "Deductible employee savings/provident-fund contribution shown in Curacao wage-tax guidance, capped at ANG 840.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Curacao resident salary uses the official 2026 income-tax fixed-base table and the ANG 2,915 basic tax credit.",
    "Resident wage-tax allowances from the 2026 loonbelastingverklaring are modeled when selected: single-earner allowance, child allowance categories, elderly allowance, and transferred elderly allowance.",
    "Foreign taxpayers are modeled without the resident basic credit, resident allowances, or resident social insurance premiums.",
    "AOV/AWW employee premiums are modeled as deductible wage-tax items up to the ANG 100,000 premium wage ceiling.",
    "BVZ and AVBZ employee premiums are modeled separately using published SVB rates and wage ceilings.",
  ],
  modeledExclusions: [
    "Double child allowance or transferred child allowance claims need spouse-specific annual-return facts. Pension-plan-specific employee premiums beyond the modeled provident-fund cap, illness or accident insurance variations, treaty exemptions, and non-wage income need plan, policy, or legal details before they can be exposed as accurate salary controls.",
  ],
  sourceUrls: [...CW_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"CW">;
