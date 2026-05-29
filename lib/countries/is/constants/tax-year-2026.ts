import type { NordicTaxConfig } from "../../nordic-shared";

export const IS_TAX_YEAR = 2026;
export const IS_SOURCE_URLS = {
  skatturinnBrackets: "https://www.skatturinn.is/english/individuals/tax-brackets/2026",
  skatturinnKeyRates: "https://www.skatturinn.is/english/individuals/key-rates-and-amounts/2026/",
  pwcOtherTaxes: "https://taxsummaries.pwc.com/Iceland/Individual/Other-taxes",
} as const;

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
    "Includes a 4% mandatory employee pension contribution as an employee deduction from pay and taxable wage base. Supplementary private pension savings are not part of payroll withholding in this calculator.",
    "Union dues, per-municipality differences beyond the published withholding brackets, foreign expert relief, transferable spouse bracket amounts, and child benefits are outside scope.",
  ],
  sourceUrls: [IS_SOURCE_URLS.skatturinnBrackets, IS_SOURCE_URLS.skatturinnKeyRates, IS_SOURCE_URLS.pwcOtherTaxes],
};
