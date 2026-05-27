import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { ZACalculatorInputs } from "../types";

export const ZA_TAX_YEAR = 2026;
export const ZA_RETIREMENT_DEDUCTION_CAP = 430000;
export const ZA_RETIREMENT_DEDUCTION_RATE = 0.275;
export const ZA_PRIMARY_REBATE = 17820;
export const ZA_SECONDARY_REBATE = 9765;
export const ZA_TERTIARY_REBATE = 3249;
export const ZA_MEDICAL_FIRST_TWO_MONTHLY_CREDIT = 376;
export const ZA_MEDICAL_ADDITIONAL_MONTHLY_CREDIT = 254;
export const ZA_DONATION_DEDUCTION_RATE = 0.1;

export const ZA_SOURCE_URLS = [
  "https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/",
  "https://www.sars.gov.za/wp-content/uploads/Docs/Budget/Budget2026/Budget-tax-guide-2026-web-version.pdf",
  "https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/",
  "https://www.sars.gov.za/about/sars-tax-and-customs-system/budget/budget-2026-frequently-asked-questions/",
  "https://www.sars.gov.za/guide-for-employers-in-respect-of-fringe-benefits/",
  "https://www.sars.gov.za/faq/faq-what-is-remuneration-for-tax-purposes/",
] as const;

function asZAInputs(inputs?: unknown): Partial<ZACalculatorInputs> {
  return (inputs ?? {}) as Partial<ZACalculatorInputs>;
}

function calculateRetirementLimit(grossSalary: number): number {
  return Math.min(
    ZA_RETIREMENT_DEDUCTION_CAP,
    grossSalary * ZA_RETIREMENT_DEDUCTION_RATE,
  );
}

function getRetirementContribution(grossSalary: number, inputs?: unknown) {
  return Math.min(
    Math.max(0, asZAInputs(inputs).contributions?.retirementContribution ?? 0),
    calculateRetirementLimit(grossSalary),
  );
}

function calculateDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}) {
  const taxableBeforeDonations = Math.max(
    0,
    grossSalary - getRetirementContribution(grossSalary, inputs),
  );

  return taxableBeforeDonations * ZA_DONATION_DEDUCTION_RATE;
}

function getAgeRebate(inputs?: unknown): number {
  switch (asZAInputs(inputs).ageBand ?? "under65") {
    case "age75plus":
      return ZA_SECONDARY_REBATE + ZA_TERTIARY_REBATE;
    case "age65to74":
      return ZA_SECONDARY_REBATE;
    case "under65":
      return 0;
  }
}

function getMedicalSchemeFeeCredit(inputs?: unknown): number {
  const members = Math.max(0, asZAInputs(inputs).medicalSchemeMembers ?? 0);

  if (members === 0) {
    return 0;
  }

  return (
    (Math.min(members, 2) * ZA_MEDICAL_FIRST_TWO_MONTHLY_CREDIT +
      Math.max(0, members - 2) * ZA_MEDICAL_ADDITIONAL_MONTHLY_CREDIT) *
    12
  );
}

function getAdditionalMedicalExpensesCredit({
  taxableIncome,
  inputs,
}: {
  taxableIncome: number;
  inputs?: unknown;
}) {
  const zaInputs = asZAInputs(inputs);
  const annualMedicalSchemeFees = Math.max(
    0,
    zaInputs.contributions?.insurancePremiums ?? 0,
  );
  const qualifyingExpenses = Math.max(
    0,
    zaInputs.contributions?.medicalExpenses ?? 0,
  );
  const medicalSchemeFeeCredit = getMedicalSchemeFeeCredit(inputs);
  const isAge65OrDisabled =
    zaInputs.ageBand === "age65to74" ||
    zaInputs.ageBand === "age75plus" ||
    zaInputs.hasDisabilityInFamily === true;

  if (isAge65OrDisabled) {
    return (
      (qualifyingExpenses +
        Math.max(0, annualMedicalSchemeFees - 3 * medicalSchemeFeeCredit)) /
      3
    );
  }

  const excessBase =
    qualifyingExpenses +
    Math.max(0, annualMedicalSchemeFees - 4 * medicalSchemeFeeCredit);

  return Math.max(0, excessBase - taxableIncome * 0.075) * 0.25;
}

export const ZA_TAX_CONFIG = {
  code: "ZA",
  currency: "ZAR",
  taxYear: ZA_TAX_YEAR,
  defaultSalary: 900000,
  incomeTaxName: "PAYE income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [
    { name: "Primary rebate", amount: ZA_PRIMARY_REBATE },
    {
      name: "Age rebate",
      calculate: ({ inputs }) => getAgeRebate(inputs),
    },
    {
      name: "Medical scheme fees tax credit",
      calculate: ({ inputs }) => getMedicalSchemeFeeCredit(inputs),
    },
    {
      name: "Additional medical expenses tax credit",
      calculate: ({ taxableIncome, inputs }) =>
        getAdditionalMedicalExpensesCredit({ taxableIncome, inputs }),
    },
  ],
  brackets: [
    { min: 0, max: 245100, rate: 0.18 },
    { min: 245100, max: 383100, rate: 0.26 },
    { min: 383100, max: 530200, rate: 0.31 },
    { min: 530200, max: 695800, rate: 0.36 },
    { min: 695800, max: 887000, rate: 0.39 },
    { min: 887000, max: 1878600, rate: 0.41 },
    { min: 1878600, max: Infinity, rate: 0.45 },
  ],
  socialContributions: [
    {
      name: "UIF employee contribution",
      rate: 0.01,
      cap: 212544,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Retirement fund contribution",
      limit: ZA_RETIREMENT_DEDUCTION_CAP,
      limitRate: ZA_RETIREMENT_DEDUCTION_RATE,
      description:
        "SARS pension, provident, or retirement annuity deduction: up to 27.5% of remuneration or taxable income, capped at R430,000.",
      taxTreatment: "deduction",
    },
    {
      key: "charitableDonations",
      name: "Section 18A PBO donations",
      calculateLimit: calculateDonationLimit,
      description:
        "Qualifying donations to approved public benefit organisations, modeled up to 10% of taxable employment income after retirement deductions.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "South Africa is modeled with the SARS 2026/27 individual tax table, primary rebate, and age rebates.",
    "UIF is modeled as a 1% employee contribution on remuneration below the SARS/UIF cap used by the model.",
    "Retirement fund contributions are capped at the lower of 27.5% of modeled salary and R430,000.",
    "Medical scheme fees tax credit is modeled at R376 per month for each of the first two covered people and R254 per month for each additional dependant.",
    "Additional medical expenses tax credit follows the SARS age/disability and under-65 formulas using modeled taxable income.",
    "Section 18A donations are modeled as annual-return deductions capped at 10% of taxable employment income after retirement deductions.",
    "Taxable fringe benefits can be entered as annual cash-equivalent remuneration values; they increase PAYE and UIF bases but are not treated as cash salary.",
  ],
  modeledExclusions: [
    "Travel allowance deductions, company car fringe-benefit reductions, fringe-benefit valuation worksheets, home-office deductions, assessed losses, capital gains, foreign tax credits, provisional tax timing, and carry-forward of excess retirement contributions or donations are excluded.",
    "Employer retirement contributions are not a separate input; include taxable employer-contribution fringe benefits in the taxable fringe-benefits input and the employee/member contribution amount in the retirement input when applicable.",
  ],
  sourceUrls: [...ZA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"ZA">;
