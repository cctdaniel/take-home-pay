import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { SICalculatorInputs } from "../types";

export const SI_TAX_YEAR = 2026;
export const SI_GENERAL_ALLOWANCE = 5551.93;
export const SI_ADDITIONAL_GENERAL_ALLOWANCE_FORMULA_AMOUNT = 20832.39;
export const SI_ADDITIONAL_GENERAL_ALLOWANCE_PHASEOUT_RATE = 1.17259;
export const SI_FULL_DISABILITY_ALLOWANCE = 20196.38;
export const SI_AGE_70_ALLOWANCE = 1665.58;
export const SI_YOUNG_WORKER_ALLOWANCE = 1443.5;
export const SI_DEPENDENT_CHILD_BASE_ALLOWANCE = 2995.83;
export const SI_SPECIAL_CARE_CHILD_BASE_ALLOWANCE = 10856.24;
export const SI_OTHER_DEPENDENT_ALLOWANCE = 2995.83;
export const SI_CHILD_ORDINAL_INCREASES = [
  0,
  260.94,
  2436.19,
  4611.44,
  6786.68,
] as const;
export const SI_ADDITIONAL_CHILD_ALLOWANCE_INCREASE = 2175.25;
export const SI_SUPPLEMENTARY_PENSION_LIMIT = 3224.18;
export const SI_SUPPLEMENTARY_PENSION_LIMIT_RATE = 0.05844;
export const SI_MEAL_REIMBURSEMENT_DAILY_JAN_JUN_2026 = 7.4;
export const SI_TRANSPORT_KILOMETRE_RATE_PETROL_SHARE = 0.1;
export const SI_MAY_2026_NMB95_PRICE = 1.64652;
export const SI_PUBLIC_SECTOR_HOLIDAY_ALLOWANCE_2026 = 1630.07;
export const SI_MINIMUM_HOLIDAY_ALLOWANCE_2026 = 1481.88;

export const SI_SOURCE_URLS = [
  "https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2025-01-3538/pravilnik-o-dolocitvi-usklajenih-zneskov-olajsav-enacbe-za-dolocitev-olajsave-in-lestvice-za-odmero-dohodnine-za-leto-2026",
  "https://www.fu.gov.si/zivljenjski_dogodki_prebivalci/vzdrzevani_druzinski_clani/",
  "https://www.fu.gov.si/en/life_events_individuals/dependent_family_members",
  "https://www.fu.gov.si/davki_in_druge_dajatve/podrocja/dohodnina/dohodnina_dohodek_iz_zaposlitve/pripomocek_za_izracun_splosne_olajsave_v_letu_2026_pri_izracunu_akontacije_dohodnine_od_mesecnega_dohodka_iz_delovnega_razmerja",
  "https://taxsummaries.pwc.com/slovenia/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/slovenia/individual/other-taxes",
  "https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/slovenia_e96deb88.html",
  "https://www.gov.si/teme/povracila-stroskov-in-drugi-osebni-prejemki/",
  "https://www.gov.si/novice/2026-04-17-pravico-do-regresa-za-letni-dopust-ima-vsak-delavec-ki-ima-sklenjeno-pogodbo-o-zaposlitvi/",
  "https://www.gov.si/novice/2026-04-17-v-javnem-sektorju-polni-regres-za-letni-dopust-za-leto-2026-znasa-1-63007-eur/",
] as const;

function asSIInputs(inputs?: unknown): Partial<SICalculatorInputs> {
  return (inputs ?? {}) as Partial<SICalculatorInputs>;
}

function clampCount(value: number | undefined, max = 10): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(value ?? 0)), max);
}

function calculateChildOrdinalIncrease(childIndex: number): number {
  if (childIndex <= 0) {
    return 0;
  }

  if (childIndex <= SI_CHILD_ORDINAL_INCREASES.length) {
    return SI_CHILD_ORDINAL_INCREASES[childIndex - 1] ?? 0;
  }

  return (
    SI_CHILD_ORDINAL_INCREASES[SI_CHILD_ORDINAL_INCREASES.length - 1] +
    (childIndex - SI_CHILD_ORDINAL_INCREASES.length) *
      SI_ADDITIONAL_CHILD_ALLOWANCE_INCREASE
  );
}

function calculateDependentChildAllowance(inputs?: unknown): number {
  const siInputs = asSIInputs(inputs);
  const ordinaryChildren = clampCount(siInputs.numberOfDependentChildren);
  const specialCareChildren = clampCount(siInputs.numberOfSpecialCareChildren);
  const totalChildren = ordinaryChildren + specialCareChildren;
  let ordinalIncreases = 0;

  for (let childIndex = 1; childIndex <= totalChildren; childIndex += 1) {
    ordinalIncreases += calculateChildOrdinalIncrease(childIndex);
  }

  return (
    ordinaryChildren * SI_DEPENDENT_CHILD_BASE_ALLOWANCE +
    specialCareChildren * SI_SPECIAL_CARE_CHILD_BASE_ALLOWANCE +
    ordinalIncreases
  );
}

function calculateOtherDependentAllowance(inputs?: unknown): number {
  return (
    clampCount(asSIInputs(inputs).numberOfOtherDependents) *
    SI_OTHER_DEPENDENT_ALLOWANCE
  );
}

function calculateFullDisabilityAllowance(inputs?: unknown): number {
  return asSIInputs(inputs).isFullyDisabled
    ? SI_FULL_DISABILITY_ALLOWANCE
    : 0;
}

function calculateAge70Allowance(inputs?: unknown): number {
  return (asSIInputs(inputs).age ?? 0) >= 70 ? SI_AGE_70_ALLOWANCE : 0;
}

function calculateYoungWorkerAllowance(inputs?: unknown): number {
  const siInputs = asSIInputs(inputs);

  return siInputs.isResidentYoungWorker && (siInputs.age ?? 99) < 29
    ? SI_YOUNG_WORKER_ALLOWANCE
    : 0;
}

export const SI_TAX_CONFIG = {
  code: "SI",
  currency: "EUR",
  taxYear: SI_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [
    { name: "General allowance", amount: SI_GENERAL_ALLOWANCE },
    {
      name: "Additional low-income general allowance",
      amount: SI_ADDITIONAL_GENERAL_ALLOWANCE_FORMULA_AMOUNT,
      phaseOut: {
        start: 0,
        rate: SI_ADDITIONAL_GENERAL_ALLOWANCE_PHASEOUT_RATE,
      },
    },
    {
      name: "Dependent child allowance",
      calculateAmount: ({ inputs }) => calculateDependentChildAllowance(inputs),
    },
    {
      name: "Other dependent family-member allowance",
      calculateAmount: ({ inputs }) => calculateOtherDependentAllowance(inputs),
    },
    {
      name: "100% disability personal allowance",
      calculateAmount: ({ inputs }) => calculateFullDisabilityAllowance(inputs),
    },
    {
      name: "Age 70+ personal allowance",
      calculateAmount: ({ inputs }) => calculateAge70Allowance(inputs),
    },
    {
      name: "Resident young-worker allowance",
      calculateAmount: ({ inputs }) => calculateYoungWorkerAllowance(inputs),
    },
  ],
  taxCredits: [],
  brackets: [{ min: 0, max: 9721.43, rate: 0.16 }, { min: 9721.43, max: 28592.44, rate: 0.26 }, { min: 28592.44, max: 57184.88, rate: 0.33 }, { min: 57184.88, max: 82346.23, rate: 0.39 }, { min: 82346.23, max: Infinity, rate: 0.5 }],
  resolveSocialContributions: ({ grossSalary }) => [
    {
      name: "Employee social security and long-term care contributions",
      rate: 0.231,
      preTax: true,
    },
    {
      name: "Compulsory health contribution",
      amount: grossSalary > 0 ? 467.94 : 0,
      preTax: true,
    },
  ],
  voluntaryContributions: [{ key: "retirementContribution", name: "Supplementary pension contribution", limit: SI_SUPPLEMENTARY_PENSION_LIMIT, limitRate: SI_SUPPLEMENTARY_PENSION_LIMIT_RATE, description: "Slovenian supplementary pension deduction: up to 5.844% of modeled salary, capped at EUR 3,224.18 for 2026.", taxTreatment: "deduction" }],
  assumptions: [
    "Slovenia is modeled with the 2026 five-band resident PIT schedule and the EUR 5,551.93 general allowance.",
    "The additional low-income general allowance is modeled with the 2026 official formula and phases out as income rises.",
    "Dependent child, special-care child, other dependent family-member, 100% disability, age 70+, and resident young-worker allowances are modeled from the 2026 published allowance amounts.",
    "Employee social security is modeled at 23.1%, with the fixed compulsory health contribution annualized from January-February 2026 and March-December 2026 amounts.",
    "Supplementary pension contributions are capped at the lower of 5.844% of modeled salary and EUR 3,224.18.",
    "Tax-exempt meal reimbursement, commuting reimbursement, and holiday allowance are modeled as cash paid on top of taxable salary and do not increase the PIT or social-security base.",
  ],
  modeledExclusions: [
    "New-resident relief mechanics, business-performance pay exemptions, employer contributions, student allowances, non-professional volunteer relief, and month-by-month withholding timing are not modeled.",
  ],
  sourceUrls: [...SI_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"SI">;
