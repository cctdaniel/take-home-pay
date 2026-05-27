import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { PLCalculatorInputs, PLPitZeroRelief, PLPpkRate } from "../types";

export const PL_TAX_YEAR = 2026;
export const PL_TAX_FREE_AMOUNT = 30000;
export const PL_STANDARD_EMPLOYEE_COSTS = 3000;
export const PL_PENSION_DISABILITY_RATE = 0.1126;
export const PL_PENSION_DISABILITY_CAP = 282600;
export const PL_SICKNESS_RATE = 0.0245;
export const PL_HEALTH_RATE = 0.09;
export const PL_IKZE_LIMIT = 10407.6;
export const PL_DONATION_DEDUCTION_LIMIT_RATE = 0.06;
export const PL_INTERNET_RELIEF_LIMIT = 760;
export const PL_PIT_ZERO_RELIEF_LIMIT = 85528;
export const PL_CHILD_RELIEF_FIRST_OR_SECOND = 1112.04;
export const PL_CHILD_RELIEF_THIRD = 2000.04;
export const PL_CHILD_RELIEF_FOURTH_PLUS = 2700;

export const PL_SOURCE_URLS = [
  "https://www.podatki.gov.pl/en/residents/personal-income-tax-rates/",
  "https://podatki.gov.pl/ulgi-i-odliczenia/ulga-dla-mlodych-pit/",
  "https://www.podatki.gov.pl/ulgi/ulga-na-powrot-pit/",
  "https://www.podatki.gov.pl/twoj-e-pit/en-pit-36-za-2025-rok/",
  "https://www.podatki.gov.pl/ulgi/ulga-na-ikze-pit/",
  "https://www.podatki.gov.pl/ulgi-i-odliczenia/ulga-na-dziecko-pit/",
  "https://www.podatki.gov.pl/darowizny/darowizny-na-cele-pozytku-publicznego-pit/",
  "https://www.podatki.gov.pl/media/z5abnlba/pit-o-broszura-za-2025-r.pdf",
  "https://www.zus.pl/en/firmy/rozliczenia-z-zus/skladki-na-ubezpieczenia",
  "https://www.zus.pl/firmy/rozliczenia-z-zus/skladki-na-ubezpieczenia/zdrowotne",
  "https://taxsummaries.pwc.com/poland/individual/other-taxes",
] as const;

export function getPLPpkRateValue(rate: PLPpkRate): number {
  return Number(rate) / 100;
}

function asPLInputs(inputs?: unknown): Partial<PLCalculatorInputs> {
  return (inputs ?? {}) as Partial<PLCalculatorInputs>;
}

function normalizePitZeroRelief(value?: PLPitZeroRelief): PLPitZeroRelief {
  switch (value) {
    case "youth_under_26":
    case "return_relief":
    case "family_4plus":
    case "working_senior":
      return value;
    default:
      return "none";
  }
}

function calculatePensionDisabilityContribution(grossSalary: number): number {
  return (
    Math.min(Math.max(0, grossSalary), PL_PENSION_DISABILITY_CAP) *
    PL_PENSION_DISABILITY_RATE
  );
}

function calculateSicknessContribution(grossSalary: number): number {
  return Math.max(0, grossSalary) * PL_SICKNESS_RATE;
}

function calculatePitZeroTaxBaseEffect({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (normalizePitZeroRelief(asPLInputs(inputs).pitZeroRelief) === "none") {
    return 0;
  }

  const normalizedGross = Math.max(0, grossSalary);

  if (normalizedGross <= 0) {
    return 0;
  }

  const exemptRevenue = Math.min(normalizedGross, PL_PIT_ZERO_RELIEF_LIMIT);
  const employeeSocialOnExemptRevenue =
    (calculatePensionDisabilityContribution(normalizedGross) +
      calculateSicknessContribution(normalizedGross)) *
    (exemptRevenue / normalizedGross);

  return Math.max(0, exemptRevenue - employeeSocialOnExemptRevenue);
}

export function calculatePLPITOIncomeBase(
  grossSalary: number,
  inputs?: unknown,
): number {
  return Math.max(
    0,
    Math.max(0, grossSalary) -
      calculatePensionDisabilityContribution(grossSalary) -
      calculateSicknessContribution(grossSalary) -
      PL_STANDARD_EMPLOYEE_COSTS -
      calculatePitZeroTaxBaseEffect({ grossSalary, inputs }),
  );
}

function calculateChildRelief(inputs?: unknown): number {
  const children = Math.min(
    Math.max(0, asPLInputs(inputs).numberOfChildren ?? 0),
    10,
  );

  if (children <= 0) {
    return 0;
  }

  let relief = 0;

  for (let index = 0; index < children; index += 1) {
    if (index < 2) {
      relief += PL_CHILD_RELIEF_FIRST_OR_SECOND;
      continue;
    }

    if (index === 2) {
      relief += PL_CHILD_RELIEF_THIRD;
      continue;
    }

    relief += PL_CHILD_RELIEF_FOURTH_PLUS;
  }

  return relief;
}

export const PL_TAX_CONFIG = {
  code: "PL",
  currency: "PLN",
  taxYear: PL_TAX_YEAR,
  defaultSalary: 180000,
  incomeTaxName: "Personal income tax",
  personalAllowance: PL_TAX_FREE_AMOUNT,
  deductions: [
    {
      name: "PIT-0 exempt revenue tax-base effect",
      calculateAmount: ({ grossSalary, inputs }) =>
        calculatePitZeroTaxBaseEffect({ grossSalary, inputs }),
    },
    { name: "Standard employee revenue costs", amount: PL_STANDARD_EMPLOYEE_COSTS },
  ],
  taxCredits: [
    {
      name: "Child tax relief",
      calculate: ({ inputs }) => calculateChildRelief(inputs),
    },
  ],
  brackets: [{ min: 0, max: 90000, rate: 0.12 }, { min: 90000, max: Infinity, rate: 0.32 }],
  resolveSocialContributions: ({ inputs }) => {
    const ppkRate = getPLPpkRateValue(asPLInputs(inputs).ppkRate ?? "0");
    const contributions = [
      { name: "Pension and disability insurance", rate: PL_PENSION_DISABILITY_RATE, cap: PL_PENSION_DISABILITY_CAP, preTax: true },
      { name: "Sickness insurance", rate: PL_SICKNESS_RATE, preTax: true },
      { name: "Health insurance contribution", rate: PL_HEALTH_RATE, preTax: false, base: "grossMinusPriorPreTaxContributions" as const },
    ];

    return ppkRate > 0
      ? [
          ...contributions,
          {
            name: "PPK employee contribution",
            rate: ppkRate,
            preTax: false,
          },
        ]
      : contributions;
  },
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "IKZE retirement contribution",
      limit: PL_IKZE_LIMIT,
      description: "Modeled IKZE annual retirement contribution limit for employees.",
      taxTreatment: "deduction",
    },
    {
      key: "charitableDonations",
      name: "PIT/O donations",
      calculateLimit: ({ grossSalary, inputs }) =>
        calculatePLPITOIncomeBase(grossSalary, inputs) *
        PL_DONATION_DEDUCTION_LIMIT_RATE,
      description:
        "PIT/O donations to public-benefit, religious worship, blood-donation, vocational-training, or listed reconstruction purposes, capped at 6% of modeled salary income.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Internet relief",
      calculateLimit: ({ grossSalary, inputs }) =>
        Math.min(PL_INTERNET_RELIEF_LIMIT, calculatePLPITOIncomeBase(grossSalary, inputs)),
      description:
        "Internet relief for eligible first/two-consecutive-year claims, capped at PLN 760 annually.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: ["Poland is modeled with the PLN 30,000 tax-free amount and 12%/32% tax scale.", "PIT-0 reliefs for young people, return relief, families 4+, and working seniors share the PLN 85,528 annual exempt-revenue cap; the calculator exposes them as one mutually exclusive salary input.", "The PIT-0 tax-base effect is reduced by employee social contributions attributable to exempt revenue so those contributions are not double-deducted from taxable income.", "Employee pension/disability insurance is capped at the 2026 annual base, sickness insurance is uncapped, and the 9% health contribution is calculated on gross salary after employee social insurance.", "A standard single-employment revenue cost allowance of PLN 3,000 per year is included.", "Child tax relief is modeled with the standard annual amounts for each child; the single-child income test and refundable unused relief are not modeled.", "PPK employee contributions are modeled as post-tax payroll cash deductions when selected.", "IKZE, PIT/O donation relief, and eligible internet relief are modeled as annual-return deductions when entered."],
  modeledExclusions: ["Joint filing, PIT-2 monthly withholding timing, creative 50% costs, solidarity levy, remote-worker cost variants, PIT-0 eligibility-document checks, rehabilitation and thermomodernisation reliefs, and refundable unused child relief are not modeled."],
  sourceUrls: [...PL_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"PL">;
