import type { NordicTaxConfig } from "../../nordic-shared";

export const IS_TAX_YEAR = 2026;
export const IS_SOURCE_URLS = {
  skatturinnBrackets: "https://www.skatturinn.is/english/individuals/tax-brackets/2026",
  skatturinnKeyRates: "https://www.skatturinn.is/english/individuals/key-rates-and-amounts/2026/",
  skatturinnDeductions: "https://www.skatturinn.is/english/individuals/allowances-deductions-and-credits/",
  skatturinnPublicBenefitDonations: "https://www.skatturinn.is/einstaklingar/tekjur-og-fradraettir/skattfradrattur-vegna-gjafa-framlaga/",
  skatturinnForeignExperts: "https://www.skatturinn.is/english/individuals/foreign-experts/",
  islandPensionContribution: "https://island.is/en/pension-fund-contribution",
  pwcOtherTaxes: "https://taxsummaries.pwc.com/Iceland/Individual/Other-taxes",
} as const;

export const IS_PRIVATE_PENSION_DEDUCTION_RATE = 0.04;
export const IS_PUBLIC_BENEFIT_DONATION_MINIMUM = 10_000;
export const IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT = 350_000;
export const IS_FOREIGN_EXPERT_RELIEF_RATE = 0.25;
export const IS_FOREIGN_EXPERT_RELIEF_YEARS = 3;

export const IS_TAX_CONFIG: NordicTaxConfig = {
  code: "IS",
  currency: "ISK",
  taxYear: IS_TAX_YEAR,
  defaultSalary: 9_600_000,
  standardDeduction: 0,
  employeeSocialRate: 0.04,
  employeeSocialName: "Mandatory employee pension contribution",
  deductEmployeeSocialBeforeIncomeTax: true,
  taxCredit: 72_492 * 12,
  brackets: [
    { min: 0, max: 498_122 * 12, rate: 0.3149 },
    { min: 498_122 * 12, max: 1_398_450 * 12, rate: 0.3799 },
    { min: 1_398_450 * 12, max: Infinity, rate: 0.4629 },
  ],
  assumptions: [
    "Models Icelandic salary withholding brackets for a full-year resident using the annualized 2026 monthly tax brackets and personal tax credit.",
    "Includes the 4% mandatory employee pension contribution as an employee deduction from pay and taxable wage base.",
    "Private supplementary pension savings are modeled as a deductible employee contribution up to 4% of salary.",
    "Donations to organisations on Skatturinn's public-benefit register are modeled as an annual income-tax-base deduction when the year's gifts are at least ISK 10,000, capped at ISK 350,000.",
    "Approved foreign expert relief can be selected separately. It reduces the modeled income-tax base by 25% of gross salary for the first three years, while pension contribution bases remain on total income.",
    "Skatturinn's English employee-deduction guidance says no other significant employment-income deductions apply beyond pension deductions; union dues, per-municipality differences beyond the published withholding brackets, transferable spouse credits, child benefits, housing interest subsidies, and treaty positions require separate payroll, household, asset, or legal facts.",
  ],
  sourceUrls: [
    IS_SOURCE_URLS.skatturinnBrackets,
    IS_SOURCE_URLS.skatturinnKeyRates,
    IS_SOURCE_URLS.skatturinnDeductions,
    IS_SOURCE_URLS.skatturinnPublicBenefitDonations,
    IS_SOURCE_URLS.skatturinnForeignExperts,
    IS_SOURCE_URLS.islandPensionContribution,
    IS_SOURCE_URLS.pwcOtherTaxes,
  ],
};
