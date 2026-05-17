import type { TaxBracket } from "../../types";

export const CANADA_TAX_YEAR = 2026;

export const CANADA_FEDERAL_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 58_523, rate: 0.14 },
  { min: 58_523, max: 117_045, rate: 0.205 },
  { min: 117_045, max: 181_440, rate: 0.26 },
  { min: 181_440, max: 258_482, rate: 0.29 },
  { min: 258_482, max: Infinity, rate: 0.33 },
];

// Ontario is the default province for the first Canada rollout.
export const ONTARIO_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 53_891, rate: 0.0505 },
  { min: 53_891, max: 107_785, rate: 0.0915 },
  { min: 107_785, max: 150_000, rate: 0.1116 },
  { min: 150_000, max: 220_000, rate: 0.1216 },
  { min: 220_000, max: Infinity, rate: 0.1316 },
];

export const CANADA_CPP_2026 = {
  maximumPensionableEarnings: 74_600,
  maximumAdditionalPensionableEarnings: 85_000,
  basicExemption: 3_500,
  employeeRate: 0.0595,
  secondAdditionalEmployeeRate: 0.04,
  maximumEmployeeContribution: 4_230.45,
  maximumSecondAdditionalEmployeeContribution: 416,
};

export const CANADA_EI_2026 = {
  maximumInsurableEarnings: 68_900,
  employeeRate: 0.0163,
  maximumEmployeePremium: 1_123.07,
};

export const CANADA_RRSP_2026 = {
  contributionRateLimit: 0.18,
  annualDollarLimit: 33_810,
};

export const CANADA_SOURCE_URLS = [
  "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html",
];
