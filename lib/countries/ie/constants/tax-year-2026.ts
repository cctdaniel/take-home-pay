export const IE_TAX_YEAR = 2026;

export const IE_SOURCE_URLS = {
  source1:
    "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-rates-bands-and-reliefs/index.aspx",
  source2:
    "https://taxsummaries.pwc.com/ireland/individual/taxes-on-personal-income",
  source3: "https://www.revenue.ie/en/jobs-and-pensions/usc/index.aspx",
  source4:
    "https://www.revenue.ie/en/jobs-and-pensions/pension/relief/tax-relief-limits.aspx",
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
  pensionReliefPercent: 0.15,
  taxStatuses: {
    single: {
      name: "Single employee",
      standardRateBand: 44_000,
      taxCredit: 4_000,
    },
    married_one_income: {
      name: "Married/civil partners, one income",
      standardRateBand: 53_000,
      taxCredit: 5_750,
    },
    married_two_incomes: {
      name: "Married/civil partners, two incomes",
      standardRateBand: 88_000,
      taxCredit: 8_000,
    },
  },
  taxCredit: 4_000,
  brackets: [
    { min: 0, max: 44_000, rate: 0.2 },
    { min: 44_000, max: Infinity, rate: 0.4 },
  ],
  assumptions: [
    "Models an Irish PAYE employee with selectable single or married/civil-partner standard rate bands and PAYE/personal tax credits.",
    "Employee PRSI is modeled as a flat rate on gross salary and reduces take-home pay.",
    "Universal Social Charge is modeled separately with the annual exemption limit and progressive USC bands, then added to total deductions when applicable.",
    "Optional pension contributions are modeled as cash deductions with income-tax relief up to the modeled age-band cap proxy; they do not reduce PRSI or USC in this simplified model.",
    "Age exemptions, medical-card USC rates, detailed pension age bands/earnings caps, local property tax, benefit-in-kind detail, and week-one payroll timing are outside this salary model.",
  ],
  sourceUrls: Object.values(IE_SOURCE_URLS),
};
