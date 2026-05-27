import type {
  StandardCountryContributionRule,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { BACalculatorInputs, BAEntity } from "../types";

export const BA_TAX_YEAR = 2026;

export const BA_SOURCE_URLS = [
  "https://www.pufbih.ba/v1/public/upload/zakoni/d9bf6-zakon-o-porezu-na-dohodak-ispravan-tekst.pdf",
  "https://www.pufbih.ba/v1/public/upload/zakoni/a3dc5-pravilnik-o-primjeni-zakona-o-porezu-na-dohodak-precisceni-zadnji.pdf",
  "https://www.pufbih.ba/v1/public/upload/zakoni/7f742-64-08-bos.pdf",
  "https://poreskaupravars.org/izmjene-u-podnosenju-obrasca-1002-od-01-01-2026-godine-3/",
  "https://poreskaupravars.org/pitanja-i-odgovori/dohodak/",
  "https://skupstinabd.ba/index.php/ba/zakon.html?id=%2FZakon+o+porezu+na+dohodak&lang=ba",
  "https://taxsummaries.pwc.com/bosnia-and-herzegovina/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/bosnia-and-herzegovina/individual/other-taxes",
  "https://taxsummaries.pwc.com/bosnia-and-herzegovina/individual/deductions",
] as const;

const BA_FBIH_ALLOWANCES = {
  personalAnnual: 3600,
  spouseMonthly: 150,
  firstChildMonthly: 150,
  secondChildMonthly: 270,
  thirdAndNextChildMonthly: 90,
  parentMonthly: 90,
};
const BA_RS_ALLOWANCES = {
  personalAnnual: 6000,
  dependentAnnual: 900,
};
const BA_BD_ALLOWANCES = {
  personalAnnual: 6000,
  dependentAnnual: 3000,
  disabilityPerTwentyPercent: 600,
  permanentDisabilityAnnual: 3000,
};

function getEntity(inputs: BACalculatorInputs): BAEntity {
  return inputs.entity ?? "fbih";
}

function getFBIHChildAllowance(children: number): number {
  const dependentChildren = Math.max(0, Math.floor(children));

  if (dependentChildren <= 0) {
    return 0;
  }

  return (
    BA_FBIH_ALLOWANCES.firstChildMonthly +
    (dependentChildren >= 2 ? BA_FBIH_ALLOWANCES.secondChildMonthly : 0) +
    Math.max(0, dependentChildren - 2) *
      BA_FBIH_ALLOWANCES.thirdAndNextChildMonthly
  );
}

function getPersonalAllowance(inputs: BACalculatorInputs): number {
  const entity = getEntity(inputs);

  switch (entity) {
    case "rs":
      return (
        BA_RS_ALLOWANCES.personalAnnual +
        Math.max(0, Math.floor(inputs.otherDependents ?? 0)) *
          BA_RS_ALLOWANCES.dependentAnnual
      );
    case "bd":
      return (
        BA_BD_ALLOWANCES.personalAnnual +
        Math.max(0, Math.floor(inputs.otherDependents ?? 0)) *
          BA_BD_ALLOWANCES.dependentAnnual +
        Math.floor(Math.max(0, inputs.bdDisabilityPercent ?? 0) / 20) *
          BA_BD_ALLOWANCES.disabilityPerTwentyPercent +
        (inputs.bdPermanentDisability
          ? BA_BD_ALLOWANCES.permanentDisabilityAnnual
          : 0)
      );
    case "fbih":
      return (
        BA_FBIH_ALLOWANCES.personalAnnual +
        ((inputs.hasDependentSpouse ? BA_FBIH_ALLOWANCES.spouseMonthly : 0) +
          getFBIHChildAllowance(inputs.dependentChildren ?? 0) +
          Math.max(0, Math.floor(inputs.dependentParents ?? 0)) *
            BA_FBIH_ALLOWANCES.parentMonthly) *
          12
      );
  }
}

function getIncomeTaxRate(entity: BAEntity): number {
  return entity === "rs" ? 0.08 : 0.1;
}

function getSocialContributionRules(
  entity: BAEntity,
): StandardCountryContributionRule[] {
  switch (entity) {
    case "rs":
      return [
        {
          name: "Pension and disability insurance",
          rate: 0.185,
          preTax: false,
        },
        {
          name: "Health insurance contribution",
          rate: 0.102,
          preTax: false,
        },
        {
          name: "Child protection contribution",
          rate: 0.017,
          preTax: false,
        },
        {
          name: "Unemployment insurance contribution",
          rate: 0.006,
          preTax: false,
        },
      ];
    case "bd":
      return [
        {
          name: "Pension and disability insurance",
          rate: 0.17,
          preTax: true,
        },
        {
          name: "Health insurance contribution",
          rate: 0.12,
          preTax: true,
        },
        {
          name: "Unemployment insurance contribution",
          rate: 0.02,
          preTax: true,
        },
      ];
    case "fbih":
      return [
        {
          name: "Pension and disability insurance",
          rate: 0.17,
          preTax: true,
        },
        {
          name: "Health insurance contribution",
          rate: 0.125,
          preTax: true,
        },
        {
          name: "Unemployment insurance contribution",
          rate: 0.015,
          preTax: true,
        },
      ];
  }
}

export const BA_TAX_CONFIG = {
  code: "BA",
  currency: "BAM",
  taxYear: BA_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Personal income tax",
  resolvePersonalAllowance: ({ inputs }) =>
    getPersonalAllowance(inputs as BACalculatorInputs),
  deductions: [
    {
      name: "Mortgage interest",
      calculateAmount: ({ inputs }) =>
        Math.max(
          0,
          (inputs as BACalculatorInputs).contributions.mortgageInterest ?? 0,
        ),
    },
    {
      name: "Life insurance premium",
      calculateAmount: ({ inputs }) =>
        getEntity(inputs as BACalculatorInputs) === "fbih"
          ? Math.max(
              0,
              (inputs as BACalculatorInputs).contributions
                .lifeInsurancePremium ?? 0,
            )
          : 0,
    },
    {
      name: "Children education costs",
      calculateAmount: ({ inputs }) =>
        getEntity(inputs as BACalculatorInputs) === "bd"
          ? Math.max(
              0,
              (inputs as BACalculatorInputs).contributions.educationExpenses ??
                0,
            )
          : 0,
    },
  ],
  taxCredits: [],
  resolveBrackets: ({ inputs }) => [
    {
      min: 0,
      max: Infinity,
      rate: getIncomeTaxRate(getEntity(inputs as BACalculatorInputs)),
    },
  ],
  brackets: [{ min: 0, max: Infinity, rate: 0.1 }],
  resolveSocialContributions: ({ inputs }) =>
    getSocialContributionRules(getEntity(inputs as BACalculatorInputs)),
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "RS voluntary pension insurance",
      calculateLimit: ({ inputs }) =>
        getEntity(inputs as BACalculatorInputs) === "rs" ? 1200 : 0,
      description:
        "Republika Srpska voluntary retirement insurance deduction, capped at BAM 1,200 annually.",
      taxTreatment: "deduction",
    },
    {
      key: "qualifyingExpenses",
      name: "RS/Brcko life insurance premium",
      calculateLimit: ({ inputs }) =>
        getEntity(inputs as BACalculatorInputs) === "bd"
          ? 1800
          : getEntity(inputs as BACalculatorInputs) === "rs"
            ? 1200
            : 0,
      description:
        "Entity life insurance premium deduction, capped at BAM 1,200 in Republika Srpska or BAM 1,800 in Brcko District.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Federation of Bosnia and Herzegovina uses 10% personal income tax, BAM 300 monthly personal allowance, spouse/child/parent allowances, and 31% employee contributions that reduce the PIT base.",
    "Republika Srpska uses 8% personal income tax, BAM 6,000 annual personal allowance, BAM 900 per dependent, and 31% employee contributions withheld from gross salary; RS contributions are not modeled as reducing the PIT base.",
    "Brcko District uses 10% personal income tax, BAM 6,000 annual personal allowance, BAM 3,000 dependent allowance, disability deductions, and a simplified employee contribution model with the FBiH pension-fund option.",
    "Mortgage interest is modeled as an uncapped entered amount for all three entities; FBiH life insurance and Brcko children education costs are modeled as uncapped entered amounts from the current deduction summary.",
    "Entity-specific capped voluntary deduction sliders appear where this calculator models an annual cap.",
  ],
  modeledExclusions: [
    "RS sector-specific BAM 50 monthly exempt wage rules, Brcko pension fund choice, employer-only charges, cantonal rules, and eligibility-document checks are not modeled.",
  ],
  sourceUrls: [...BA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"BA">;
