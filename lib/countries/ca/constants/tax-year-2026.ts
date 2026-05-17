import type { TaxBracket } from "../../types";

export const CANADA_TAX_YEAR = 2026;

export const CANADA_FEDERAL_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 58_523, rate: 0.14 },
  { min: 58_523, max: 117_045, rate: 0.205 },
  { min: 117_045, max: 181_440, rate: 0.26 },
  { min: 181_440, max: 258_482, rate: 0.29 },
  { min: 258_482, max: Infinity, rate: 0.33 },
];

export const CANADA_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export type CanadaProvinceCode = (typeof CANADA_PROVINCES)[number]["code"];

export const CANADA_PROVINCIAL_TAX_BRACKETS_2026: Record<CanadaProvinceCode, TaxBracket[]> = {
  AB: [
    { min: 0, max: 61_200, rate: 0.08 },
    { min: 61_200, max: 154_259, rate: 0.10 },
    { min: 154_259, max: 185_111, rate: 0.12 },
    { min: 185_111, max: 246_813, rate: 0.13 },
    { min: 246_813, max: 370_220, rate: 0.14 },
    { min: 370_220, max: Infinity, rate: 0.15 },
  ],
  BC: [
    { min: 0, max: 50_363, rate: 0.0506 },
    { min: 50_363, max: 100_728, rate: 0.077 },
    { min: 100_728, max: 115_648, rate: 0.105 },
    { min: 115_648, max: 140_430, rate: 0.1229 },
    { min: 140_430, max: 190_405, rate: 0.147 },
    { min: 190_405, max: 265_545, rate: 0.168 },
    { min: 265_545, max: Infinity, rate: 0.205 },
  ],
  MB: [
    { min: 0, max: 47_000, rate: 0.108 },
    { min: 47_000, max: 100_000, rate: 0.1275 },
    { min: 100_000, max: Infinity, rate: 0.174 },
  ],
  NB: [
    { min: 0, max: 52_333, rate: 0.094 },
    { min: 52_333, max: 104_666, rate: 0.14 },
    { min: 104_666, max: 193_861, rate: 0.16 },
    { min: 193_861, max: Infinity, rate: 0.195 },
  ],
  NL: [
    { min: 0, max: 44_678, rate: 0.087 },
    { min: 44_678, max: 89_354, rate: 0.145 },
    { min: 89_354, max: 159_528, rate: 0.158 },
    { min: 159_528, max: 223_340, rate: 0.178 },
    { min: 223_340, max: 285_319, rate: 0.198 },
    { min: 285_319, max: 570_638, rate: 0.208 },
    { min: 570_638, max: 1_141_275, rate: 0.213 },
    { min: 1_141_275, max: Infinity, rate: 0.218 },
  ],
  NS: [
    { min: 0, max: 30_995, rate: 0.0879 },
    { min: 30_995, max: 61_991, rate: 0.1495 },
    { min: 61_991, max: 97_417, rate: 0.1667 },
    { min: 97_417, max: 157_124, rate: 0.175 },
    { min: 157_124, max: Infinity, rate: 0.21 },
  ],
  NT: [
    { min: 0, max: 53_003, rate: 0.059 },
    { min: 53_003, max: 106_009, rate: 0.086 },
    { min: 106_009, max: 172_346, rate: 0.122 },
    { min: 172_346, max: Infinity, rate: 0.1405 },
  ],
  NU: [
    { min: 0, max: 55_801, rate: 0.04 },
    { min: 55_801, max: 111_602, rate: 0.07 },
    { min: 111_602, max: 181_439, rate: 0.09 },
    { min: 181_439, max: Infinity, rate: 0.115 },
  ],
  ON: [
    { min: 0, max: 53_891, rate: 0.0505 },
    { min: 53_891, max: 107_785, rate: 0.0915 },
    { min: 107_785, max: 150_000, rate: 0.1116 },
    { min: 150_000, max: 220_000, rate: 0.1216 },
    { min: 220_000, max: Infinity, rate: 0.1316 },
  ],
  PE: [
    { min: 0, max: 33_928, rate: 0.095 },
    { min: 33_928, max: 65_820, rate: 0.1347 },
    { min: 65_820, max: 106_890, rate: 0.166 },
    { min: 106_890, max: 142_250, rate: 0.1762 },
    { min: 142_250, max: Infinity, rate: 0.19 },
  ],
  QC: [
    { min: 0, max: 54_345, rate: 0.14 },
    { min: 54_345, max: 108_680, rate: 0.19 },
    { min: 108_680, max: 132_245, rate: 0.24 },
    { min: 132_245, max: Infinity, rate: 0.2575 },
  ],
  SK: [
    { min: 0, max: 54_532, rate: 0.105 },
    { min: 54_532, max: 155_805, rate: 0.125 },
    { min: 155_805, max: Infinity, rate: 0.145 },
  ],
  YT: [
    { min: 0, max: 58_523, rate: 0.064 },
    { min: 58_523, max: 117_045, rate: 0.09 },
    { min: 117_045, max: 181_440, rate: 0.109 },
    { min: 181_440, max: 500_000, rate: 0.128 },
    { min: 500_000, max: Infinity, rate: 0.15 },
  ],
};

export const ONTARIO_TAX_BRACKETS_2026 = CANADA_PROVINCIAL_TAX_BRACKETS_2026.ON;

export const CANADA_CPP_2026 = {
  maximumPensionableEarnings: 74_600,
  maximumAdditionalPensionableEarnings: 85_000,
  basicExemption: 3_500,
  employeeRate: 0.0595,
  secondAdditionalEmployeeRate: 0.04,
  maximumEmployeeContribution: 4_230.45,
  maximumSecondAdditionalEmployeeContribution: 416,
};

export const CANADA_QPP_2026 = {
  maximumPensionableEarnings: 74_600,
  maximumAdditionalPensionableEarnings: 85_000,
  basicExemption: 3_500,
  employeeRate: 0.063,
  secondAdditionalEmployeeRate: 0.04,
  maximumEmployeeContribution: 4_479.30,
  maximumSecondAdditionalEmployeeContribution: 416,
};

export const CANADA_EI_2026 = {
  maximumInsurableEarnings: 68_900,
  employeeRate: 0.0163,
  maximumEmployeePremium: 1_123.07,
};

export const QUEBEC_EI_2026 = {
  maximumInsurableEarnings: 68_900,
  employeeRate: 0.013,
  maximumEmployeePremium: 895.70,
};

export const QUEBEC_QPIP_2026 = {
  maximumInsurableEarnings: 103_000,
  employeeRate: 0.0043,
  maximumEmployeePremium: 442.90,
};

export const CANADA_RRSP_2026 = {
  contributionRateLimit: 0.18,
  annualDollarLimit: 33_810,
};

export const CANADA_SOURCE_URLS = [
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html",
  "https://www.rqap-lois.gouv.qc.ca/en/news/premium-rates-and-maximum-insurable-earnings-for-2026",
];
