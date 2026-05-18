export const IE_TAX_YEAR = 2026;

export const IE_SOURCE_URLS = {
  source1: "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-rates-bands-and-reliefs/index.aspx",
  source2: "https://taxsummaries.pwc.com/ireland/individual/taxes-on-personal-income",
  source3: "https://www.revenue.ie/en/jobs-and-pensions/usc/index.aspx",
} as const;

export const IE_TAX_CONFIG = {
  code: "IE",
  currency: "EUR",
  taxYear: IE_TAX_YEAR,
  defaultSalary: 55000,
  standardDeduction: 0,
  employeeSocialRate: 0.042,
  employeeSocialName: "Employee PRSI",
  deductEmployeeSocialBeforeIncomeTax: false,
  taxCredit: 4_000,
  brackets: [{ min: 0, max: 44_000, rate: 0.20 }, { min: 44_000, max: Infinity, rate: 0.40 }],
  assumptions: [
    "Models a single PAYE employee with the standard single rate band and the personal plus employee PAYE credits.",
    "Employee PRSI is modeled as a flat rate on gross salary and reduces take-home pay.",
    "Universal Social Charge is modeled separately with the annual exemption limit and progressive USC bands, then added to total deductions when applicable.",
    "Married/civil-partner bands, age exemptions, medical-card USC rates, pension relief, local property tax, benefit-in-kind detail, and week-one payroll timing are outside this salary model.",
  ],
  sourceUrls: Object.values(IE_SOURCE_URLS),
};
