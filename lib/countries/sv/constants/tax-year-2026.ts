import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { SVCalculatorInputs } from "../types";

export const SV_TAX_YEAR = 2026;
export const SV_ISSS_EMPLOYEE_RATE = 0.03;
export const SV_ISSS_MONTHLY_CAP = 1000;
export const SV_AFP_EMPLOYEE_RATE = 0.0725;
export const SV_VOLUNTARY_AFP_LIMIT_RATE = 0.1;
export const SV_MEDICAL_EXPENSE_LIMIT = 800;
export const SV_EDUCATION_EXPENSE_LIMIT = 800;
export const SV_DONATION_NET_INCOME_LIMIT_RATE = 0.2;

export const SV_SOURCE_URLS = [
  "https://www.mh.gob.sv/renta-2026/",
  "https://sitio.aduana.gob.sv/wp-content/uploads/download-manager-files/LEY-DE-IMPUESTO-SOBRE-LA-RENTA-ACTUALIZADA-CON-EL-D.-O.-N%C2%B0-79-T.-447-30-DE-ABRIL-DE-2025.pdf",
  "https://www.mh.gob.sv/wp-content/uploads/2020/11/PMHDC8221.pdf",
  "https://www.ssf.gob.sv/images/stories/descarga_otras_leyes/Ley_impuesto_sobre_la_renta.pdf",
  "https://taxsummaries.pwc.com/el-salvador/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/el-salvador/individual/other-taxes",
  "https://taxsummaries.pwc.com/el-salvador/individual/deductions",
] as const;

function asSVInputs(inputs?: unknown): Partial<SVCalculatorInputs> {
  return (inputs ?? {}) as Partial<SVCalculatorInputs>;
}

function getSVContribution(
  inputs: unknown,
  key: keyof SVCalculatorInputs["contributions"],
): number {
  return Math.max(0, asSVInputs(inputs).contributions?.[key] ?? 0);
}

function calculateSVMandatoryEmployeeDeductions(grossSalary: number): number {
  return (
    Math.min(grossSalary, SV_ISSS_MONTHLY_CAP * 12) *
      SV_ISSS_EMPLOYEE_RATE +
    grossSalary * SV_AFP_EMPLOYEE_RATE
  );
}

function calculateSVVoluntaryAfpLimit(grossSalary: number): number {
  return grossSalary * SV_VOLUNTARY_AFP_LIMIT_RATE;
}

function calculateSVDocumentedDuesLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const voluntaryAfp = Math.min(
    getSVContribution(inputs, "retirementContribution"),
    calculateSVVoluntaryAfpLimit(grossSalary),
  );
  const medicalExpenses = Math.min(
    getSVContribution(inputs, "medicalExpenses"),
    SV_MEDICAL_EXPENSE_LIMIT,
  );
  const educationExpenses = Math.min(
    getSVContribution(inputs, "educationExpenses"),
    SV_EDUCATION_EXPENSE_LIMIT,
  );

  return Math.max(
    0,
    grossSalary -
      calculateSVMandatoryEmployeeDeductions(grossSalary) -
      voluntaryAfp -
      medicalExpenses -
      educationExpenses,
  );
}

function calculateSVDonationLimit({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const documentedDues = Math.min(
    getSVContribution(inputs, "qualifyingExpenses"),
    calculateSVDocumentedDuesLimit({ grossSalary, inputs }),
  );
  const netIncomeBeforeDonation = Math.max(
    0,
    calculateSVDocumentedDuesLimit({ grossSalary, inputs }) - documentedDues,
  );

  return (
    netIncomeBeforeDonation *
    (SV_DONATION_NET_INCOME_LIMIT_RATE /
      (1 + SV_DONATION_NET_INCOME_LIMIT_RATE))
  );
}

export const SV_TAX_CONFIG = {
  code: "SV",
  currency: "USD",
  taxYear: SV_TAX_YEAR,
  defaultSalary: 48000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 550 * 12, rate: 0 },
    {
      min: 550 * 12,
      max: 895.24 * 12,
      rate: 0.1,
      baseTax: 17.67 * 12,
      rateBase: 472 * 12,
    },
    {
      min: 895.24 * 12,
      max: 2038.1 * 12,
      rate: 0.2,
      baseTax: 60 * 12,
      rateBase: 895.24 * 12,
    },
    {
      min: 2038.1 * 12,
      max: Infinity,
      rate: 0.3,
      baseTax: 288.57 * 12,
      rateBase: 2038.1 * 12,
    },
  ],
  socialContributions: [
    {
      name: "ISSS employee contribution",
      rate: SV_ISSS_EMPLOYEE_RATE,
      cap: SV_ISSS_MONTHLY_CAP * 12,
      preTax: true,
    },
    {
      name: "AFP pension employee contribution",
      rate: SV_AFP_EMPLOYEE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary AFP pension contribution",
      calculateLimit: ({ grossSalary }) =>
        calculateSVVoluntaryAfpLimit(grossSalary),
      description:
        "Additional voluntary AFP contribution, deductible up to 10% of monthly income reported to the pension fund.",
      taxTreatment: "deduction",
    },
    {
      key: "medicalExpenses",
      name: "Medical expenses",
      limit: SV_MEDICAL_EXPENSE_LIMIT,
      description:
        "Annual medical expense deduction for salaried individuals above the filing threshold, capped at USD 800.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Education expenses",
      limit: SV_EDUCATION_EXPENSE_LIMIT,
      description:
        "Annual education expense deduction for salaried individuals above the filing threshold, capped at USD 800.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Documented union or worker-association dues",
      calculateLimit: calculateSVDocumentedDuesLimit,
      description:
        "Documented dues or contributions to qualifying unions, worker associations, foundations, or guilds, limited here to the remaining modeled salary base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Qualifying donations",
      calculateLimit: calculateSVDonationLimit,
      description:
        "Documented donations to qualifying entities under Article 32, capped at 20% of net income after the donation; this is equivalent to one-sixth of the modeled pre-donation net salary base.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "El Salvador salary tax uses the official monthly withholding table annualized over 12 equal pay periods, including the fixed tax amounts in each taxable band.",
    "ISSS employee contributions are capped at USD 30 per month, and AFP employee contributions are modeled at 7.25% of total monthly salary.",
    "Voluntary AFP contributions are modeled as deductible up to 10% of reported pensionable salary.",
    "Medical and education expenses are modeled as annual-return deductions up to USD 800 per category.",
    "Documented union or worker-association dues and qualifying donations are modeled as annual-return deductions. Donation relief is capped at 20% of net income after the donation.",
  ],
  modeledExclusions: [
    "Documentation checks for donations or worker-association dues, bonuses, Quincena 25 implementation from 2027, non-domiciled 30% taxation, and business or activity-specific expense deductions are excluded.",
  ],
  sourceUrls: [...SV_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"SV">;
