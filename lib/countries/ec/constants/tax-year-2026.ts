import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { ECCalculatorInputs, ECIncomeExemptionType } from "../types";

export const EC_TAX_YEAR = 2026;

export const EC_2026_BASIC_FAMILY_BASKET = 821.8;
export const EC_PERSONAL_EXPENSE_REBATE_RATE = 0.18;
export const EC_IESS_EMPLOYEE_RATE = 0.0945;
export const EC_ZERO_RATE_BASIC_FRACTION_2026 = 12208;
export const EC_FAMILY_DEPENDENT_BASKETS = {
  0: 7,
  1: 9,
  2: 11,
  3: 14,
  4: 17,
  5: 20,
} as const;
export const EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS = 100;
export const EC_INCOME_EXEMPTIONS_2026: Record<
  ECIncomeExemptionType,
  { name: string; amount: number }
> = {
  none: { name: "No older-adult or disability exemption", amount: 0 },
  olderAdult: {
    name: "Older adult income exemption",
    amount: EC_ZERO_RATE_BASIC_FRACTION_2026,
  },
  disability30to49: {
    name: "Disability/sustituto exemption (30%-49%)",
    amount: EC_ZERO_RATE_BASIC_FRACTION_2026 * 2 * 0.6,
  },
  disability50to74: {
    name: "Disability/sustituto exemption (50%-74%)",
    amount: EC_ZERO_RATE_BASIC_FRACTION_2026 * 2 * 0.7,
  },
  disability75to84: {
    name: "Disability/sustituto exemption (75%-84%)",
    amount: EC_ZERO_RATE_BASIC_FRACTION_2026 * 2 * 0.8,
  },
  disability85to100: {
    name: "Disability/sustituto exemption (85%-100%)",
    amount: EC_ZERO_RATE_BASIC_FRACTION_2026 * 2,
  },
};

export const EC_SOURCE_URLS = [
  "https://www.sri.gob.ec/en/web/intersri/impuesto-renta",
  "https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar/fa75d2ba-c784-4b33-af3a-8390f2f7af13/Tablas%20c%C3%A1lculo%20IR.pdf",
  "https://www.sri.gob.ec/detalle-noticias?idnoticia=1261&marquesina=1",
  "https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar/ea002a89-17d8-4cdf-be42-affedbe3f8d8/BOLET%25C3%258DN%2520006%2520-%2520SRI%2520HABILITA%2520LA%2520PROYECCI%25C3%2593N%2520DE%2520GASTOS%2520PERSONALES%25202026%2520PARA%2520REDUCIR%2520EL%2520IMPUESTO%2520A%2520LA%2520RENTA.pdf",
  "https://taxsummaries.pwc.com/ecuador/individual/taxes-on-personal-income",
] as const;

function asECInputs(inputs?: unknown): Partial<ECCalculatorInputs> {
  return (inputs ?? {}) as Partial<ECCalculatorInputs>;
}

function resolvePersonalExpenseBasketCount(inputs?: unknown): number {
  const ecInputs = asECInputs(inputs);

  if (ecInputs.hasDisabilityOrCatastrophicIllness) {
    return EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS;
  }

  const dependents = Math.min(Math.max(0, ecInputs.familyDependents ?? 0), 5);

  return EC_FAMILY_DEPENDENT_BASKETS[
    dependents as keyof typeof EC_FAMILY_DEPENDENT_BASKETS
  ];
}

export function getECIncomeExemption(
  exemptionType: ECIncomeExemptionType = "none",
) {
  return EC_INCOME_EXEMPTIONS_2026[exemptionType] ?? EC_INCOME_EXEMPTIONS_2026.none;
}

export function getECPersonalExpenseBasketCount(inputs?: unknown) {
  return resolvePersonalExpenseBasketCount(inputs);
}

function calculatePersonalExpenseLimit({
  inputs,
}: {
  inputs?: unknown;
}) {
  return (
    EC_2026_BASIC_FAMILY_BASKET * resolvePersonalExpenseBasketCount(inputs)
  );
}

export const EC_TAX_CONFIG = {
  code: "EC",
  currency: "USD",
  taxYear: EC_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  resolvePersonalAllowance: ({ inputs }) =>
    getECIncomeExemption(asECInputs(inputs).incomeExemptionType).amount,
  deductions: [],
  taxCredits: [],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 12208, rate: 0 },
    { min: 12208, max: 15549, rate: 0.05, rateBase: 12208 },
    { min: 15549, max: 20188, rate: 0.1, baseTax: 167, rateBase: 15549 },
    { min: 20188, max: 26700, rate: 0.12, baseTax: 631, rateBase: 20188 },
    { min: 26700, max: 35136, rate: 0.15, baseTax: 1412, rateBase: 26700 },
    { min: 35136, max: 46575, rate: 0.2, baseTax: 2678, rateBase: 35136 },
    { min: 46575, max: 62005, rate: 0.25, baseTax: 4965, rateBase: 46575 },
    { min: 62005, max: 82679, rate: 0.3, baseTax: 8823, rateBase: 62005 },
    { min: 82679, max: 109956, rate: 0.35, baseTax: 15025, rateBase: 82679 },
    { min: 109956, max: Infinity, rate: 0.37, baseTax: 24572, rateBase: 109956 },
  ],
  socialContributions: [
    {
      name: "IESS employee contribution",
      rate: EC_IESS_EMPLOYEE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "Qualifying personal expenses",
      calculateLimit: calculatePersonalExpenseLimit,
      description:
        "Projected qualifying personal expenses for the SRI income-tax rebate, capped by the selected family-dependent basket schedule.",
      taxTreatment: "credit",
      cashFlowTreatment: "taxOnly",
      creditRate: EC_PERSONAL_EXPENSE_REBATE_RATE,
      creditCap:
        EC_2026_BASIC_FAMILY_BASKET *
        EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS *
        EC_PERSONAL_EXPENSE_REBATE_RATE,
    },
  ],
  assumptions: [
    "Ecuador resident employment income uses the SRI 2026 natural-person income tax table with fixed tax amounts by basic fraction.",
    "IESS employee contribution is modeled at the standard 9.45% and reduces the income-tax base.",
    "Older-adult and disability/sustituto income exemptions are modeled from the SRI taxable-base rules: one zero-rate basic fraction for older adults, or two zero-rate basic fractions multiplied by the SRI disability percentage table.",
    "The personal-expense rebate is modeled at 18% of qualifying expenses, capped by the SRI 2026 basket count for the selected number of family dependents.",
    "The disability/catastrophic-illness option applies the SRI 100-basic-family-basket limit.",
  ],
  modeledExclusions: [
    "RIMPE/business deductions, item-category receipt validation, and special deductions outside resident salary income and the personal-expense rebate are not modeled.",
  ],
  sourceUrls: [...EC_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"EC">;
