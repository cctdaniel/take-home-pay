export const BE_TAX_YEAR = 2026;

export const BE_SOURCE_URLS = {
  source1: "https://taxsummaries.pwc.com/belgium/individual/taxes-on-personal-income",
  source2: "https://finance.belgium.be/en/private-individuals/tax-return/tax-rates-income/tax-rates",
} as const;

export const BE_TAX_CONFIG = {
  code: "BE",
  currency: "EUR",
  taxYear: BE_TAX_YEAR,
  defaultSalary: 50000,
  standardDeduction: (grossSalary: number) => Math.min(grossSalary * 0.30, 5_750),
  employeeSocialRate: 0.1307,
  employeeSocialName: "Employee social security (ONSS/RSZ)",
  deductEmployeeSocialBeforeIncomeTax: true,
  additionalFlatIncomeTaxName: "Municipal surcharge proxy",
  additionalFlatIncomeTaxRate: 0.07,
  taxCredit: 0,
  brackets: [{ min: 0, max: 15_820, rate: 0.25 }, { min: 15_820, max: 27_920, rate: 0.40 }, { min: 27_920, max: 48_320, rate: 0.45 }, { min: 48_320, max: Infinity, rate: 0.50 }],
  assumptions: [
    "Models an ordinary Belgian resident employee with federal progressive personal income tax and employee social security.",
    "A standard professional-expense deduction proxy is applied before tax, capped by the modeled annual maximum.",
    "Municipal surcharge is modeled as a representative percentage of taxable income rather than an exact commune percentage.",
    "Personal tax-free allowance refinements, marital quotient, dependent children, work bonus reductions, regional tax reductions, benefits in kind, special expatriate regime, and exact municipal rates are outside this salary model.",
  ],
  sourceUrls: Object.values(BE_SOURCE_URLS),
};
