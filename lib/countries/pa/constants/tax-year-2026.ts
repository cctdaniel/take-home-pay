import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { PACalculatorInputs } from "../types";

export const PA_TAX_YEAR = 2026;
export const PA_MARRIED_PERSONAL_EXEMPTION = 800;
export const PA_RETIREMENT_FUND_LIMIT = 15000;
export const PA_MORTGAGE_INTEREST_LIMIT = 15000;
export const PA_EDUCATION_EXPENSE_LIMIT_PER_STUDENT = 3600;
export const PA_CHARITABLE_DONATION_LIMIT = 50000;
export const PA_SOCIAL_SECURITY_RATE = 0.0975;
export const PA_EDUCATIONAL_INSURANCE_RATE = 0.0125;

export const PA_SOURCE_URLS = [
  "https://dgi.mef.gob.pa/DInforme/Formulario05.php",
  "https://dgi.mef.gob.pa/DC/DIGE.php",
  "https://etax2.mef.gob.pa/etax2web/microayudas/Ayuda_Renta/Instructivo_Declaracion_Naturalvrl.htm",
  "https://www.css.gob.pa/afiliacion-al-asegurado/",
  "https://www.css.gob.pa/wp-content/wdocs/memoria-2025.pdf",
  "https://www.mef.gob.pa/wp-content/uploads/2025/09/Manual-de-Clasificaciones-Presupuestaria-del-Ingreso-Publico.pdf",
  "https://taxsummaries.pwc.com/panama/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/panama/individual/deductions",
  "https://taxsummaries.pwc.com/panama/individual/other-taxes",
] as const;

function asPAInputs(inputs?: unknown): Partial<PACalculatorInputs> {
  return (inputs ?? {}) as Partial<PACalculatorInputs>;
}

export const PA_TAX_CONFIG = {
  code: "PA",
  currency: "USD",
  taxYear: PA_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Married personal exemption",
      calculateAmount: ({ inputs }) =>
        asPAInputs(inputs).isMarried ? PA_MARRIED_PERSONAL_EXEMPTION : 0,
    },
  ],
  taxCredits: [],
  taxBracketMode: "fixedBase",
  brackets: [
    { min: 0, max: 11000, rate: 0 },
    { min: 11000, max: 50000, rate: 0.15, rateBase: 11000 },
    { min: 50000, max: Infinity, rate: 0.25, baseTax: 5850, rateBase: 50000 },
  ],
  socialContributions: [
    {
      name: "Social security employee contribution",
      rate: PA_SOCIAL_SECURITY_RATE,
      preTax: true,
    },
    {
      name: "Educational insurance",
      rate: PA_EDUCATIONAL_INSURANCE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Approved retirement fund contribution",
      calculateLimit: ({ grossSalary }) =>
        Math.min(PA_RETIREMENT_FUND_LIMIT, grossSalary * 0.1),
      description:
        "Deductible contribution to an approved retirement fund, capped at the lower of 10% of annual gross income or USD 15,000.",
      taxTreatment: "deduction",
    },
    {
      key: "housingExpenses",
      name: "Mortgage interest",
      limit: PA_MORTGAGE_INTEREST_LIMIT,
      description:
        "Interest on mortgage loans for homes or home improvements on Panama residences, capped at USD 15,000 annually.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "educationExpenses",
      name: "Education expenses",
      calculateLimit: ({ inputs }) =>
        Math.max(0, asPAInputs(inputs).educationStudents ?? 0) *
        PA_EDUCATION_EXPENSE_LIMIT_PER_STUDENT,
      description:
        "Documented education expenses, modeled at the USD 3,600 cap per selected student.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "medicalExpenses",
      name: "Medical expenses incurred in Panama",
      calculateLimit: ({ grossSalary }) => grossSalary,
      description:
        "Documented medical expenses incurred in Panama. No statutory annual cap is modeled, so the slider is limited to gross salary.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "charitableDonations",
      name: "Authorised charity or non-profit dues",
      limit: PA_CHARITABLE_DONATION_LIMIT,
      description:
        "Donations to authorised local educational or charitable institutions and dues to Panama non-profit associations, capped at USD 50,000 annually.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Panama employment income is modeled with the resident income tax brackets and fixed tax amount above USD 50,000.",
    "Social security and educational insurance are modeled as employee payroll contributions with no salary cap.",
    "Approved retirement fund contributions are modeled as deductible up to the lower of 10% of annual gross income or USD 15,000 and reduce take-home cash when entered.",
    "Married personal exemption, mortgage interest, education expenses, medical expenses incurred in Panama, authorised charity donations, and non-profit dues are modeled as annual-return deductions.",
  ],
  modeledExclusions: [
    "Detailed territorial-source analysis, education-ruling edge cases, preferential mortgage-interest classification, representation allowances, foreign earned income exclusions, and employer-only payroll costs require source-of-income, ruling, loan, or employer facts before they can be shown as accurate salary controls.",
  ],
  sourceUrls: [...PA_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"PA">;
