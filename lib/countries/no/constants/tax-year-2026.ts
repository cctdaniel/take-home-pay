import type { NordicTaxConfig } from "../../nordic-shared";

export const NO_TAX_YEAR = 2026;
export const NO_SOURCE_URLS = {
  skatteetatenBracketTax: "https://www.skatteetaten.no/satser/trinnskatt/",
  skatteetatenMinimumStandardDeduction:
    "https://www.skatteetaten.no/satser/minstefradrag/",
  skatteetatenNationalInsurance:
    "https://www.skatteetaten.no/satser/trygdeavgift/",
  skatteetatenPersonalAllowance:
    "https://www.skatteetaten.no/satser/personfradrag/",
  skatteetatenUnionDues:
    "https://www.skatteetaten.no/satser/fagforeningsfradrag/",
  skatteetatenCommutingDeduction:
    "https://www.skatteetaten.no/satser/fradrag-for-reiser-mellom-hjem-og-arbeid/",
  skatteetatenChildcareDeduction:
    "https://www.skatteetaten.no/satser/foreldrefradrag-kostnader-til-pass-og-stell-av-barn/",
  skatteetatenLoanInterest:
    "https://www.skatteetaten.no/person/skatt/hjelp-til-riktig-skatt/bank-og-lan/lan-og-renter/",
  skatteetatenIps:
    "https://www.skatteetaten.no/rettskilder/type/handboker/skatte-abc/gjeldende/p-3-pensjon--individuell-pensjonsordning-ipa-og-ips/P-3.002/P-3.004/",
  skatteetatenPaye:
    "https://www.skatteetaten.no/en/person/taxes/tax-deduction-card-and-advance-tax/i-am-a-foreign-employee/paye/",
  pwcPersonalIncome:
    "https://taxsummaries.pwc.com/norway/individual/taxes-on-personal-income",
  pwcSampleCalculation: "https://taxsummaries.pwc.com/norway/individual/sample-personal-income-tax-calculation",
} as const;

export const NO_IPS_DEDUCTION_LIMIT = 25_000;
export const NO_UNION_DUES_DEDUCTION_LIMIT = 8_700;
export const NO_CHILDCARE_DEDUCTION_2026 = {
  ordinaryFirstChild: 15_000,
  ordinaryAdditionalChild: 10_000,
  specialNeedsFirstChild: 25_000,
  specialNeedsAdditionalChild: 15_000,
} as const;
export const NO_COMMUTING_DEDUCTION_2026 = {
  ratePerKm: 1.9,
  lowerThreshold: 12_000,
  grossDeductionCap: 120_000,
} as const;
export const NO_MINIMUM_STANDARD_DEDUCTION_2026 = 95_700;
export const NO_PERSONAL_ALLOWANCE_2026 = 114_540;
export const NO_PAYE_2026 = {
  incomeThreshold: 725_050,
  rateWithNationalInsurance: 0.25,
  rateWithoutNationalInsurance: 0.174,
  nationalInsuranceRate: 0.076,
};

export const NO_TAX_CONFIG: NordicTaxConfig = {
  code: "NO",
  currency: "NOK",
  taxYear: NO_TAX_YEAR,
  defaultSalary: 700_000,
  standardDeduction:
    NO_MINIMUM_STANDARD_DEDUCTION_2026 + NO_PERSONAL_ALLOWANCE_2026,
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
    "Models resident Norwegian salary with ordinary income tax, bracket tax, personal allowance, minimum standard deduction, and employee National Insurance.",
    "Applies bracket tax to gross personal income and ordinary income tax after the modeled personal allowance, minimum standard deduction, IPS, union dues, childcare, commuting, and debt-interest deductions.",
    "PAYE for eligible foreign workers is available as a separate gross-tax scheme. It applies no deductions and is limited to income below the 2026 threshold.",
    "Wealth tax, regional employer contribution, holiday-pay timing, employer pension, and special cross-border deduction restrictions are not modeled.",
  ],
  sourceUrls: [
    NO_SOURCE_URLS.skatteetatenBracketTax,
    NO_SOURCE_URLS.skatteetatenMinimumStandardDeduction,
    NO_SOURCE_URLS.skatteetatenPersonalAllowance,
    NO_SOURCE_URLS.skatteetatenNationalInsurance,
    NO_SOURCE_URLS.skatteetatenUnionDues,
    NO_SOURCE_URLS.skatteetatenCommutingDeduction,
    NO_SOURCE_URLS.skatteetatenChildcareDeduction,
    NO_SOURCE_URLS.skatteetatenLoanInterest,
    NO_SOURCE_URLS.skatteetatenIps,
    NO_SOURCE_URLS.skatteetatenPaye,
    NO_SOURCE_URLS.pwcPersonalIncome,
    NO_SOURCE_URLS.pwcSampleCalculation,
  ],
};
