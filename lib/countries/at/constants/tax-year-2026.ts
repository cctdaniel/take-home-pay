export const AT_TAX_YEAR = 2026;

export const AT_SOURCE_URLS = {
  source1: "https://taxsummaries.pwc.com/austria/individual/taxes-on-personal-income",
  source2: "https://www.bmf.gv.at/en/topics/taxation/Tax-rates-and-allowances.html",
} as const;

export const AT_TAX_CONFIG = {
  code: "AT",
  currency: "EUR",
  taxYear: AT_TAX_YEAR,
  defaultSalary: 50000,
  standardDeduction: 0,
  employeeSocialRate: 0.1807,
  employeeSocialCap: 90720,
  employeeSocialName: "Employee social insurance (general employee rate, capped)",
  deductEmployeeSocialBeforeIncomeTax: true,
  taxCredit: 0,
  brackets: [{ min: 0, max: 13_308, rate: 0 }, { min: 13_308, max: 21_617, rate: 0.20 }, { min: 21_617, max: 35_836, rate: 0.30 }, { min: 35_836, max: 69_166, rate: 0.40 }, { min: 69_166, max: 103_072, rate: 0.48 }, { min: 103_072, max: 1_000_000, rate: 0.50 }, { min: 1_000_000, max: Infinity, rate: 0.55 }],
  assumptions: [
    "Models an ordinary Austrian resident employee using the progressive wage/income tax tariff.",
    "Employee social insurance is modeled with the general employee rate and an annualized contribution-base cap.",
    "Social insurance reduces the taxable base and take-home pay; no separate state or municipal employee income tax is modeled.",
    "13th/14th salary preferential taxation, commuter allowance, family bonus plus, single-earner credits, church contributions, in-kind benefits, and detailed monthly payroll caps are outside this annual salary model.",
  ],
  sourceUrls: Object.values(AT_SOURCE_URLS),
};
