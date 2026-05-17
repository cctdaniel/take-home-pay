export const IT_TAX_YEAR = 2026;

export const IT_SOURCE_URLS = {
  source1: "https://taxsummaries.pwc.com/italy/individual/taxes-on-personal-income",
  source2: "https://www.agenziaentrate.gov.it/portale/web/english/nse/individuals/taxation-and-taxpayer-compliance",
} as const;

export const IT_TAX_CONFIG = {
  code: "IT",
  currency: "EUR",
  taxYear: IT_TAX_YEAR,
  defaultSalary: 42000,
  standardDeduction: 0,
  employeeSocialRate: 0.0919,
  employeeSocialName: "Employee INPS social security (approx.)",
  deductEmployeeSocialBeforeIncomeTax: true,
  additionalFlatIncomeTaxName: "Regional/municipal add-ons (average proxy)",
  additionalFlatIncomeTaxRate: 0.02,
  taxCredit: (grossSalary: number) => grossSalary <= 15_000 ? 1_955 : grossSalary <= 28_000 ? Math.max(0, 1_910 + 1_190 * ((28_000 - grossSalary) / 13_000)) : grossSalary <= 50_000 ? Math.max(0, 1_910 * ((50_000 - grossSalary) / 22_000)) : 0,
  brackets: [{ min: 0, max: 28_000, rate: 0.23 }, { min: 28_000, max: 50_000, rate: 0.35 }, { min: 50_000, max: Infinity, rate: 0.43 }],
  assumptions: [
    "Models an ordinary full-year resident employee under the national IRPEF brackets.",
    "Employee INPS contributions reduce both taxable income and take-home pay in this model.",
    "A simplified employment tax credit is applied from the standard employee credit formulas, and regional/municipal income taxes are represented by an average flat proxy.",
    "Regional addizionale, municipal addizionale, bonus/exoneration rules, spouse/dependent deductions, fringe benefits, severance pay, and employer-only costs are outside the model.",
  ],
  sourceUrls: Object.values(IT_SOURCE_URLS),
};
