import type {
  StandardCountryTaxBracket,
  StandardCountryTaxConfig,
} from "../../shared/standard-country";
import type { LUCalculatorInputs, LUTaxClass } from "../types";

export const LU_TAX_YEAR = 2026;

export const LU_SOURCE_URLS = [
  "https://impotsdirects.public.lu/content/acd/fr/baremes.html",
  "https://impotsdirects.public.lu/fr/az/c/class_resid.html",
  "https://impotsdirects.public.lu/dam-assets/fr/baremes/bareme-2025-format-excel.xlsx",
  "https://impotsdirects.public.lu/fr/az/c/credit-impot-salaries/cis2026.html",
  "https://impotsdirects.public.lu/fr/az/c/credit-impot-salaire-social-minimum/cism2025.html",
  "https://impotsdirects.public.lu/fr/az/c/cim/cim2025.html",
  "https://guichet.public.lu/en/citoyens/fiscalite/declaration-impot-decompte/credit-impot/enfant-credit-impot-monoparental.html",
  "https://impotsdirects.public.lu/fr/az/f/fond_empl",
  "https://ccss.public.lu/en/assiettes-cotisation.html",
  "https://fedil.lu/en/publications/social-parameters-applicable-as-from-january-1st-2026/",
  "https://taxsummaries.pwc.com/luxembourg/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/luxembourg/individual/deductions",
] as const;

const SOCIAL_SECURITY_ANNUAL_CAP = 162224.16;
const DEPENDENCY_ANNUAL_ALLOWANCE = 675.93 * 12;
const PRIVATE_PENSION_DEDUCTION_LIMIT = 4500;
const CISSM_MONTHLY_MAX = 81;
const SINGLE_PARENT_CREDIT_FULL = 3504;
const SINGLE_PARENT_CREDIT_MINIMUM = 750;
const SINGLE_PARENT_CREDIT_PHASEOUT_START = 60000;
const SINGLE_PARENT_CREDIT_PHASEOUT_END = 105000;
const SINGLE_PARENT_CREDIT_PHASEOUT_RATE = 0.0612;
const SINGLE_PARENT_SUPPORT_ALLOWANCE_EXEMPT = 2712;
const SINGLE_PARENT_SUPPORT_ALLOWANCE_REDUCTION_RATE = 0.5;

interface LuxembourgFormulaRow {
  min: number;
  max: number;
  rate: number;
  deduction: number;
}

const LU_TAX_CLASS_FORMULAS: Record<LUTaxClass, LuxembourgFormulaRow[]> = {
  class1: [
    { min: 0, max: 13200, rate: 0, deduction: 0 },
    { min: 13250, max: 15400, rate: 0.08, deduction: 1058.4 },
    { min: 15450, max: 17600, rate: 0.09, deduction: 1212.75 },
    { min: 17650, max: 19800, rate: 0.1, deduction: 1389.15 },
    { min: 19850, max: 22050, rate: 0.11, deduction: 1587.6 },
    { min: 22100, max: 24250, rate: 0.12, deduction: 1808.1 },
    { min: 24300, max: 26550, rate: 0.14, deduction: 2293.2 },
    { min: 26600, max: 28800, rate: 0.16, deduction: 2824.2 },
    { min: 28850, max: 31100, rate: 0.18, deduction: 3401.1 },
    { min: 31150, max: 33400, rate: 0.2, deduction: 4023.9 },
    { min: 33450, max: 35700, rate: 0.22, deduction: 4692.6 },
    { min: 35750, max: 38000, rate: 0.24, deduction: 5407.2 },
    { min: 38050, max: 40300, rate: 0.26, deduction: 6167.7 },
    { min: 40350, max: 42600, rate: 0.28, deduction: 6974.1 },
    { min: 42650, max: 44900, rate: 0.3, deduction: 7826.4 },
    { min: 44950, max: 47200, rate: 0.32, deduction: 8724.6 },
    { min: 47250, max: 49500, rate: 0.34, deduction: 9668.7 },
    { min: 49550, max: 51750, rate: 0.36, deduction: 10658.7 },
    { min: 51800, max: 54050, rate: 0.38, deduction: 11694.6 },
    { min: 54100, max: 117450, rate: 0.39, deduction: 12235.5 },
    { min: 117500, max: 176150, rate: 0.4, deduction: 13410 },
    { min: 176200, max: 234850, rate: 0.41, deduction: 15171.6 },
    { min: 234900, max: Infinity, rate: 0.42, deduction: 17520.3 },
  ],
  class1a: [
    { min: 0, max: 26450, rate: 0, deduction: 0 },
    { min: 26500, max: 28200, rate: 0.1, deduction: 2646 },
    { min: 28250, max: 29950, rate: 0.1125, deduction: 2998.8 },
    { min: 30000, max: 31750, rate: 0.125, deduction: 3373.65 },
    { min: 31800, max: 33500, rate: 0.1375, deduction: 3770.55 },
    { min: 33550, max: 35250, rate: 0.15, deduction: 4189.5 },
    { min: 35300, max: 37100, rate: 0.175, deduction: 5071.5 },
    { min: 37150, max: 38950, rate: 0.2, deduction: 5999.4 },
    { min: 39000, max: 40750, rate: 0.225, deduction: 6973.2 },
    { min: 40800, max: 42600, rate: 0.25, deduction: 7992.9 },
    { min: 42650, max: 44450, rate: 0.275, deduction: 9058.5 },
    { min: 44500, max: 46250, rate: 0.3, deduction: 10170 },
    { min: 46300, max: 48100, rate: 0.325, deduction: 11327.4 },
    { min: 48150, max: 49950, rate: 0.35, deduction: 12530.7 },
    { min: 50000, max: 51800, rate: 0.375, deduction: 13779.9 },
    { min: 51850, max: 117450, rate: 0.39, deduction: 14556.96 },
    { min: 117500, max: 176150, rate: 0.4, deduction: 15731.46 },
    { min: 176200, max: 234850, rate: 0.41, deduction: 17493.06 },
    { min: 234900, max: Infinity, rate: 0.42, deduction: 19841.76 },
  ],
  class2: [
    { min: 0, max: 26450, rate: 0, deduction: 0 },
    { min: 26500, max: 30850, rate: 0.08, deduction: 2116.8 },
    { min: 30900, max: 35250, rate: 0.09, deduction: 2425.5 },
    { min: 35300, max: 39650, rate: 0.1, deduction: 2778.3 },
    { min: 39700, max: 44100, rate: 0.11, deduction: 3175.2 },
    { min: 44150, max: 48500, rate: 0.12, deduction: 3616.2 },
    { min: 48550, max: 53100, rate: 0.14, deduction: 4586.4 },
    { min: 53150, max: 57650, rate: 0.16, deduction: 5648.4 },
    { min: 57700, max: 62250, rate: 0.18, deduction: 6802.2 },
    { min: 62300, max: 66850, rate: 0.2, deduction: 8047.8 },
    { min: 66900, max: 71450, rate: 0.22, deduction: 9385.2 },
    { min: 71500, max: 76050, rate: 0.24, deduction: 10814.4 },
    { min: 76100, max: 80600, rate: 0.26, deduction: 12335.4 },
    { min: 80650, max: 85200, rate: 0.28, deduction: 13948.2 },
    { min: 85250, max: 89800, rate: 0.3, deduction: 15652.8 },
    { min: 89850, max: 94400, rate: 0.32, deduction: 17449.2 },
    { min: 94450, max: 99000, rate: 0.34, deduction: 19337.4 },
    { min: 99050, max: 103550, rate: 0.36, deduction: 21317.4 },
    { min: 103600, max: 108150, rate: 0.38, deduction: 23389.2 },
    { min: 108200, max: 234900, rate: 0.39, deduction: 24471 },
    { min: 234950, max: 352300, rate: 0.4, deduction: 26820 },
    { min: 352350, max: 469700, rate: 0.41, deduction: 30343.2 },
    { min: 469750, max: Infinity, rate: 0.42, deduction: 35040.6 },
  ],
};

const LU_EMPLOYMENT_FUND_HIGH_INCOME_OFFSETS: Record<LUTaxClass, number> = {
  class1: 931.8,
  class1a: 885.36,
  class2: 1863.6,
};

function asLUInputs(inputs?: unknown): Partial<LUCalculatorInputs> {
  return (inputs ?? {}) as Partial<LUCalculatorInputs>;
}

function resolveTaxClass(inputs?: unknown): LUTaxClass {
  const luInputs = asLUInputs(inputs);

  if (luInputs.taxClass) {
    return luInputs.taxClass;
  }

  if ((luInputs.numberOfChildren ?? 0) > 0 || (luInputs.age ?? 0) >= 65) {
    return "class1a";
  }

  return "class1";
}

function applyEmploymentFundSurchargeToFormulas(
  taxClass: LUTaxClass,
  taxableIncome: number,
): StandardCountryTaxBracket[] {
  const highIncomeThreshold = taxClass === "class2" ? 300000 : 150000;
  const multiplier = taxableIncome > highIncomeThreshold ? 1.09 : 1.07;
  const highIncomeOffset =
    taxableIncome > highIncomeThreshold
      ? LU_EMPLOYMENT_FUND_HIGH_INCOME_OFFSETS[taxClass]
      : 0;

  const rows = LU_TAX_CLASS_FORMULAS[taxClass];

  return rows.map((bracket, index) => ({
    min: index === 0 ? bracket.min : rows[index - 1].max,
    max: bracket.max,
    rate: bracket.rate * multiplier,
    rateBase: 0,
    baseTax: -(bracket.deduction * multiplier + highIncomeOffset),
  }));
}

function calculateDependencyContribution(grossSalary: number): number {
  return Math.max(0, grossSalary - DEPENDENCY_ANNUAL_ALLOWANCE) * 0.014;
}

function calculateEmployeeTaxCredit(grossSalary: number): number {
  if (grossSalary < 936 || grossSalary >= 80000) {
    return 0;
  }

  if (grossSalary <= 11265) {
    return 300 + Math.max(0, grossSalary - 936) * 0.029;
  }

  if (grossSalary <= 40000) {
    return 600;
  }

  return Math.max(0, 600 - (grossSalary - 40000) * 0.015);
}

function calculateEmployeeCo2Credit(grossSalary: number): number {
  if (grossSalary < 936 || grossSalary >= 80000) {
    return 0;
  }

  if (grossSalary <= 40000) {
    return 216;
  }

  return Math.max(0, 216 - (grossSalary - 40000) * 0.0054);
}

function calculateSocialMinimumWageCredit(grossSalary: number): number {
  const monthlyGross = grossSalary / 12;

  if (monthlyGross < 1800 || monthlyGross > 3600) {
    return 0;
  }

  if (monthlyGross <= 3000) {
    return CISSM_MONTHLY_MAX * 12;
  }

  return ((CISSM_MONTHLY_MAX / 600) * (3600 - monthlyGross)) * 12;
}

function calculateSingleParentCredit({
  taxableIncome,
  inputs,
}: {
  taxableIncome: number;
  inputs: LUCalculatorInputs;
}): number {
  if (
    !inputs.claimSingleParentCredit ||
    inputs.taxClass !== "class1a" ||
    inputs.numberOfChildren <= 0
  ) {
    return 0;
  }

  const creditBeforeSupport =
    taxableIncome < SINGLE_PARENT_CREDIT_PHASEOUT_START
      ? SINGLE_PARENT_CREDIT_FULL
      : taxableIncome <= SINGLE_PARENT_CREDIT_PHASEOUT_END
        ? Math.max(
            SINGLE_PARENT_CREDIT_MINIMUM,
            SINGLE_PARENT_CREDIT_FULL -
              (taxableIncome - SINGLE_PARENT_CREDIT_PHASEOUT_START) *
                SINGLE_PARENT_CREDIT_PHASEOUT_RATE,
          )
        : SINGLE_PARENT_CREDIT_MINIMUM;
  const supportReduction = Math.max(
    0,
    (Math.max(0, inputs.childSupportOrAllowancesReceived ?? 0) -
      SINGLE_PARENT_SUPPORT_ALLOWANCE_EXEMPT) *
      SINGLE_PARENT_SUPPORT_ALLOWANCE_REDUCTION_RATE,
  );

  return Math.max(0, creditBeforeSupport - supportReduction);
}

export const LU_TAX_CONFIG = {
  code: "LU",
  currency: "EUR",
  taxYear: LU_TAX_YEAR,
  defaultSalary: 90000,
  incomeTaxName: "Income tax including employment fund surcharge",
  personalAllowance: 0,
  deductions: [
    {
      name: "Employment expense standard deduction",
      amount: 540,
    },
    {
      name: "Special expenses standard deduction",
      amount: 480,
    },
  ],
  taxCredits: [
    {
      name: "Employee tax credit",
      calculate: ({ grossSalary }) => calculateEmployeeTaxCredit(grossSalary),
      refundable: true,
    },
    {
      name: "Employee CO2 tax credit",
      calculate: ({ grossSalary }) => calculateEmployeeCo2Credit(grossSalary),
      refundable: true,
    },
    {
      name: "Social minimum wage tax credit",
      calculate: ({ grossSalary }) =>
        calculateSocialMinimumWageCredit(grossSalary),
      refundable: true,
    },
    {
      name: "Single-parent tax credit",
      calculate: ({ taxableIncome, inputs }) =>
        calculateSingleParentCredit({
          taxableIncome,
          inputs: inputs as LUCalculatorInputs,
        }),
      refundable: true,
    },
  ],
  resolveBrackets: ({ taxableIncome, inputs }) =>
    applyEmploymentFundSurchargeToFormulas(
      resolveTaxClass(inputs),
      taxableIncome,
    ),
  brackets: applyEmploymentFundSurchargeToFormulas("class1", 0),
  taxBracketMode: "fixedBase",
  roundIncomeTax: (tax) => Math.max(0, Math.floor(tax)),
  socialContributions: [
    {
      name: "Pension insurance employee contribution",
      rate: 0.085,
      cap: SOCIAL_SECURITY_ANNUAL_CAP,
      preTax: true,
    },
    {
      name: "Health insurance employee contribution",
      rate: 0.0305,
      cap: SOCIAL_SECURITY_ANNUAL_CAP,
      preTax: true,
    },
    {
      name: "Dependency insurance contribution",
      rate: 0.014,
      calculateAmount: ({ grossSalary }) =>
        calculateDependencyContribution(grossSalary),
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Private pension savings contribution",
      limit: PRIVATE_PENSION_DEDUCTION_LIMIT,
      description:
        "Modeled Luxembourg Article 111bis private pension deduction cap from tax year 2026.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Luxembourg is modeled for a resident employee under the 2025+ tax-class formula tables still applicable in 2026.",
    "Class 1, class 1a, and class 2 use the official annual income-tax formula rows published by the Administration des contributions directes.",
    "The employment fund surcharge is included at 7%, or with the official 9% high-income formula adjustment above EUR 150,000 for classes 1/1a and EUR 300,000 for class 2.",
    "Employee pension and health insurance contributions are capped at the 2026 annual social-security ceiling; dependency insurance is uncapped and modeled after the annual exemption.",
    "The 2026 employee tax credit, employee CO2 tax credit, and social-minimum-wage tax credit are modeled as refundable payroll credits when the salary thresholds apply.",
  ],
  modeledExclusions: [
    "Children are modeled through the selected tax class where applicable; child benefits, commuting above the standard deduction, employer pension plans, exact payroll withholding tables, and non-resident treaty cases are not modeled.",
  ],
  sourceUrls: [...LU_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"LU">;
