import type { StandardCountryTaxConfig } from "../../shared/standard-country";

export const GT_TAX_YEAR = 2026;
export const GT_PERSONAL_DEDUCTION = 48000;
export const GT_VAT_INVOICE_CREDIT_LIMIT = 12000;
export const GT_VAT_INVOICE_CREDIT_RATE_LIMIT = 0.12;
export const GT_IGSS_EMPLOYEE_RATE = 0.0483;
export const GT_DONATION_RATE_LIMIT = 0.05;
export const GT_DONATION_ABSOLUTE_LIMIT = 500000;

export const GT_SOURCE_URLS = [
  "https://portal.sat.gob.gt/portal/impuesto-sobre-la-renta-isr/",
  "https://portal.sat.gob.gt/portal/preguntas-frecuentes/cumplimiento-tributario/",
  "https://www.congreso.gob.gt/assets/uploads/info_legislativo/decretos/2012/010-2012.pdf",
  "https://www.minfin.gob.gt/images/archivos/despacho/trabajadores_deben_saber2.pdf",
  "https://taxsummaries.pwc.com/guatemala/individual/taxes-on-personal-income",
] as const;

export const GT_TAX_CONFIG = {
  code: "GT",
  currency: "GTQ",
  taxYear: GT_TAX_YEAR,
  defaultSalary: 480000,
  incomeTaxName: "Employment income tax",
  personalAllowance: GT_PERSONAL_DEDUCTION,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: 300000, rate: 0.05 }, { min: 300000, max: Infinity, rate: 0.07 }],
  socialContributions: [
    {
      name: "IGSS employee contribution",
      rate: GT_IGSS_EMPLOYEE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "qualifyingExpenses",
      name: "VAT invoice credit",
      calculateLimit: ({ grossSalary }) =>
        Math.min(
          GT_VAT_INVOICE_CREDIT_LIMIT,
          Math.max(0, grossSalary) * GT_VAT_INVOICE_CREDIT_RATE_LIMIT,
        ),
      description:
        "Annual VAT credit from the personal invoice planilla, modeled as a direct ISR credit up to the lower of Q12,000 or 12% of modeled gross salary.",
      taxTreatment: "credit",
      cashFlowTreatment: "taxOnly",
      creditRate: 1,
      creditCap: GT_VAT_INVOICE_CREDIT_LIMIT,
    },
    {
      key: "charitableDonations",
      name: "Verified donations",
      calculateLimit: ({ grossSalary }) =>
        Math.min(grossSalary * GT_DONATION_RATE_LIMIT, GT_DONATION_ABSOLUTE_LIMIT),
      description:
        "Verified donations to qualifying authorized entities, capped at 5% of gross income and Q500,000 annually.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "insurancePremiums",
      name: "Death-risk life insurance premiums",
      calculateLimit: ({ grossSalary }) => grossSalary,
      description:
        "Life insurance premiums covering death risk only, with no return, refund, or surrender value; limited here to gross salary.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Guatemala employment income is modeled with the standard Q48,000 annual personal deduction and 5%/7% rentas del trabajo scale.",
    "IGSS is modeled as a deductible employee contribution on gross salary.",
    "The VAT invoice planilla is modeled as an optional direct ISR credit up to the lower of Q12,000 or 12% of modeled gross salary; the non-refundable benefit is capped at the calculated ISR.",
    "Verified donations and death-risk-only life insurance premiums are modeled as annual-return deductions for salaried employees.",
  ],
  modeledExclusions: [
    "2026 payroll withholding timing, donation solvency-document validation, and the newer minimum-wage transitional deduction mechanics are not modeled.",
    "No separate medical-expense or court-ordered-alimony slider is shown because current Article 72 salary deductions and the reviewed 2026 deduction summary list social security, life insurance, donations, the standard deduction, and VAT planilla for salaried workers.",
  ],
  sourceUrls: [...GT_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"GT">;
