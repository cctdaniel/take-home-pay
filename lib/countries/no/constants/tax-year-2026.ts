import type { NordicTaxConfig } from "../../nordic-shared";

export const NO_TAX_YEAR = 2026;
export const NO_SOURCE_URLS = {
  pwcPersonalIncome: "https://taxsummaries.pwc.com/norway/individual/taxes-on-personal-income",
  pwcSampleCalculation: "https://taxsummaries.pwc.com/norway/individual/sample-personal-income-tax-calculation",
  skatteetatenBracketTax: "https://www.skatteetaten.no/satser/trinnskatt/",
  skatteetatenIps: "https://www.skatteetaten.no/rettskilder/type/handboker/skatte-abc/gjeldende/p-3-pensjon--individuell-pensjonsordning-ipa-og-ips/P-3.002/P-3.004/",
} as const;

export const NO_IPS_DEDUCTION_LIMIT = 25_000;

export const NO_TAX_CONFIG: NordicTaxConfig = {
  code: "NO",
  currency: "NOK",
  taxYear: NO_TAX_YEAR,
  defaultSalary: 700_000,
  standardDeduction: 95_700 + 114_540,
  employeeSocialRate: 0.076,
  employeeSocialName: "Employee National Insurance contribution",
  flatTaxRate: 0.22,
  bracketTaxBase: "grossIncome",
  brackets: [
    { min: 0, max: 226_100, rate: 0 },
    { min: 226_100, max: 318_300, rate: 0.017 },
    { min: 318_300, max: 725_050, rate: 0.04 },
    { min: 725_050, max: 980_100, rate: 0.137 },
    { min: 980_100, max: 1_467_200, rate: 0.168 },
    { min: 1_467_200, max: Infinity, rate: 0.178 },
  ],
  assumptions: [
    "Models resident Norwegian salary with ordinary income tax, bracket tax, personal deduction, minimum deduction, and employee National Insurance.",
    "Applies bracket tax to gross personal income and ordinary income tax after the modeled personal deduction, minimum deduction, and IPS deduction.",
    "PAYE for temporary non-residents, wealth tax, regional employer contribution, travel/interest deductions, holiday-pay timing, and employer pension are outside this salary UI.",
  ],
  sourceUrls: [
    NO_SOURCE_URLS.pwcPersonalIncome,
    NO_SOURCE_URLS.pwcSampleCalculation,
    NO_SOURCE_URLS.skatteetatenBracketTax,
    NO_SOURCE_URLS.skatteetatenIps,
  ],
};
