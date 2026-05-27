import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { KECalculatorInputs } from "../types";

export const KE_TAX_YEAR = 2026;

export const KE_NSSF_ANNUAL_CAP_2026 = 108000 * 12;
export const KE_SHIF_ANNUAL_MINIMUM = 300 * 12;
export const KE_PENSION_DEDUCTION_LIMIT = 360000;
export const KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT = 15000 * 12;
export const KE_MORTGAGE_INTEREST_LIMIT = 30000 * 12;
export const KE_INSURANCE_RELIEF_PREMIUM_LIMIT = 400000;
export const KE_INSURANCE_RELIEF_LIMIT = 60000;
export const KE_DISABILITY_EXEMPTION_LIMIT = 150000 * 12;
export const KE_NON_CASH_BENEFIT_EXEMPT_LIMIT = 5000 * 12;

export const KE_SOURCE_URLS = [
  "https://www.kra.go.ke/individual/filing-paying/types-of-taxes/paye",
  "https://www.kra.go.ke/news-center/public-notices/2307-guidance-on-employer-obligations-in-applying-income-tax-deductions%2C-reliefs-and-exemptions",
  "https://www.kra.go.ke/news-center/public-notices/2095-income-tax-exemption-for-persons-with-disability",
  "https://www.kra.go.ke/helping-tax-payers/faqs/more-about-paye",
  "https://www.mygov.go.ke/sites/default/files/2026-02/Notice%20To%20Employers%20%E2%80%94%20Year%204%20%282026%29%20NSSF%20Contribution%20Rates%20.pdf",
] as const;

function calculateNssfEmployeeContribution(grossSalary: number): number {
  return Math.min(grossSalary, KE_NSSF_ANNUAL_CAP_2026) * 0.06;
}

function asKEInputs(inputs?: unknown): Partial<KECalculatorInputs> {
  return (inputs ?? {}) as Partial<KECalculatorInputs>;
}

export const KE_TAX_CONFIG = {
  code: "KE",
  currency: "KES",
  taxYear: KE_TAX_YEAR,
  defaultSalary: 6000000,
  incomeTaxName: "PAYE income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Persons with Disability exemption",
      calculateAmount: ({ grossSalary, inputs }) =>
        asKEInputs(inputs).hasDisabilityExemptionCertificate
          ? Math.min(grossSalary, KE_DISABILITY_EXEMPTION_LIMIT)
          : 0,
    },
  ],
  taxCredits: [{ name: "Personal relief", amount: 28800 }],
  brackets: [{ min: 0, max: 288000, rate: 0.1 }, { min: 288000, max: 388000, rate: 0.25 }, { min: 388000, max: 6000000, rate: 0.3 }, { min: 6000000, max: 9600000, rate: 0.325 }, { min: 9600000, max: Infinity, rate: 0.35 }],
  socialContributions: [
    {
      name: "NSSF employee contribution",
      rate: 0.06,
      cap: KE_NSSF_ANNUAL_CAP_2026,
      preTax: true,
    },
    {
      name: "SHIF health contribution",
      calculateAmount: ({ grossSalary }) =>
        grossSalary > 0
          ? Math.max(grossSalary * 0.0275, KE_SHIF_ANNUAL_MINIMUM)
          : 0,
      preTax: true,
    },
    { name: "Affordable Housing Levy", rate: 0.015, preTax: true },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Registered pension or retirement fund contribution",
      calculateLimit: ({ grossSalary }) =>
        Math.max(
          0,
          KE_PENSION_DEDUCTION_LIMIT -
            calculateNssfEmployeeContribution(grossSalary),
        ),
      description:
        "Additional registered pension/provident/individual retirement fund contribution, capped so total pension deductions including NSSF do not exceed KES 360,000 per year.",
      taxTreatment: "deduction",
    },
    {
      key: "medicalExpenses",
      name: "Post-retirement medical fund contribution",
      limit: KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT,
      description:
        "Contribution to a post-retirement medical fund, capped by KRA at KES 15,000 per month.",
      taxTreatment: "deduction",
    },
    {
      key: "housingExpenses",
      name: "Owner-occupied mortgage interest",
      limit: KE_MORTGAGE_INTEREST_LIMIT,
      description:
        "Mortgage interest on qualifying owner-occupied residential premises, capped by KRA at KES 30,000 per month.",
      taxTreatment: "deduction",
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Qualifying insurance premiums",
      limit: KE_INSURANCE_RELIEF_PREMIUM_LIMIT,
      description:
        "Life, health, or education insurance premiums for the 15% insurance relief, capped at KES 60,000 of relief per year.",
      taxTreatment: "credit",
      cashFlowTreatment: "taxOnly",
      creditRate: 0.15,
      creditCap: KE_INSURANCE_RELIEF_LIMIT,
    },
  ],
  assumptions: [
    "Kenya PAYE monthly bands are annualized and reduced by the standard personal relief of KES 2,400 per month.",
    "NSSF uses the February 2026 Year 4 employee cap of KES 108,000 monthly pensionable earnings, annualized over 12 equal pay periods.",
    "SHIF and the Affordable Housing Levy are modeled as allowable PAYE deductions before applying the tax bands.",
    "Taxable non-cash benefits can be entered separately and are added to the PAYE tax base after applying the KRA KES 5,000 monthly non-cash benefit threshold outside this calculator.",
    "Additional pension deductions are capped at the KRA annual pension deduction limit after modeled NSSF, and insurance relief is modeled at 15% of qualifying premiums up to KES 60,000.",
    "Post-retirement medical fund contributions, owner-occupied mortgage interest, and PWD exemption certificates are modeled from KRA PAYE guidance.",
  ],
  modeledExclusions: [
    "Employer Tier II contracting-out details, non-cash benefit valuation worksheets, employee tax exemption certificate edge cases beyond the modeled PWD exemption, and month-specific NSSF transition timing are excluded.",
  ],
  sourceUrls: [...KE_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"KE">;
