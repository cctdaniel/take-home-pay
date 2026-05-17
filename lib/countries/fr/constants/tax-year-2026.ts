export const FR_TAX_YEAR = 2026;

export const FR_SOURCE_URLS = {
  source1: "https://www.impots.gouv.fr/particulier/calcul-de-limpot-sur-le-revenu",
  source2: "https://taxsummaries.pwc.com/france/individual/taxes-on-personal-income",
  source3: "https://taxsummaries.pwc.com/france/individual/other-taxes",
} as const;

export const FR_TAX_CONFIG = {
  code: "FR",
  currency: "EUR",
  taxYear: FR_TAX_YEAR,
  defaultSalary: 45000,
  standardDeduction: (grossSalary: number) => Math.min(grossSalary * 0.10, 14_426),
  employeeSocialRate: 0.22,
  employeeSocialName: "Employee social contributions (approx.)",
  deductEmployeeSocialBeforeIncomeTax: false,
  brackets: [{ min: 0, max: 11_497, rate: 0 }, { min: 11_497, max: 29_315, rate: 0.11 }, { min: 29_315, max: 83_823, rate: 0.30 }, { min: 83_823, max: 180_294, rate: 0.41 }, { min: 180_294, max: Infinity, rate: 0.45 }],
  assumptions: [
    "Models a single full-year resident employee using the ordinary progressive income-tax scale and one family quotient part.",
    "Applies the 10% employment expense deduction, capped at the modeled annual ceiling, before income tax.",
    "Employee social contributions are approximated as a combined employee payroll contribution rate because exact French payslip rates depend on salary tranche, scheme, executive status, and complementary pension setup.",
    "Local residence taxes, family quotient variants, withholding-rate personalization, social surcharge detail, benefits in kind, and employer-only charges are outside this salary model.",
  ],
  sourceUrls: Object.values(FR_SOURCE_URLS),
};
