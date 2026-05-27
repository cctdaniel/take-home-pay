// ============================================================================
// HONG KONG TAX CONSTANTS (2025/26 - TAX YEAR 2026)
// Sources:
// - Inland Revenue Department (IRD): https://www.ird.gov.hk/eng/tax/salaries/salaries_ta.htm
// - IRD Tax Allowances: https://www.ird.gov.hk/eng/tax/salaries/allowance.htm
// - IRD Deductions: https://www.ird.gov.hk/eng/tax/salaries/deductions.htm
// - GovHK housing benefits: https://www.gov.hk/en/residents/taxes/salaries/salariestax/chargeable/residence.htm
// - IRD housing benefits: https://www.ird.gov.hk/eng/tax/ere_house.htm
// - IRD employee income: https://www.ird.gov.hk/eng/tax/ere_inc.htm
// - MPFA Mandatory Contributions: https://www.mpfa.org.hk/en/mpf-system/mpf-contributions
// - IRD 2025/26 one-off reduction and current allowance/deduction table:
//   https://www.ird.gov.hk/eng/pdf/pam61e.pdf
// - IRD VHIS FAQ: https://www.ird.gov.hk/eng/faq/vhis_qp.htm
// - IRD AR service deduction: https://www.ird.gov.hk/eng/tax/ars.htm
// ============================================================================

import type { TaxBracket } from "../../types";

export const HK_SOURCE_URLS = [
  "https://www.ird.gov.hk/eng/tax/salaries/salaries_ta.htm",
  "https://www.ird.gov.hk/eng/tax/salaries/allowance.htm",
  "https://www.ird.gov.hk/eng/tax/salaries/deductions.htm",
  "https://www.gov.hk/en/residents/taxes/salaries/salariestax/chargeable/residence.htm",
  "https://www.ird.gov.hk/eng/tax/ere_house.htm",
  "https://www.ird.gov.hk/eng/tax/ere_inc.htm",
  "https://www.mpfa.org.hk/en/mpf-system/mpf-contributions",
  "https://www.ird.gov.hk/eng/pdf/pam61e.pdf",
  "https://www.ird.gov.hk/eng/faq/vhis_qp.htm",
  "https://www.ird.gov.hk/eng/tax/ars.htm",
] as const;

export const HK_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 50000, rate: 0.02 },
  { min: 50000, max: 100000, rate: 0.06 },
  { min: 100000, max: 150000, rate: 0.1 },
  { min: 150000, max: 200000, rate: 0.14 },
  { min: 200000, max: Infinity, rate: 0.17 },
];

export const HK_STANDARD_RATE_2026 = {
  standardRate: 0.15,
  higherRate: 0.16,
  threshold: 5000000,
};

export const HK_ALLOWANCES_2026 = {
  basic: 132000,
  married: 264000,
  singleParent: 132000,
  child: 130000,
  newbornChild: 130000,
  dependentSibling: 37500,
  dependentParent: 50000,
  dependentParentLivingWith: 50000,
  disability: 75000,
  disabledDependent: 75000,
  dependentParentAged55To59: 25000,
  dependentParentAged55To59LivingWith: 25000,
};

export const HK_DEDUCTIONS_2026 = {
  selfEducationMax: 100000,
  homeLoanInterestMax: 100000,
  homeLoanInterestAdditionalMax: 20000,
  domesticRentMax: 100000,
  domesticRentAdditionalMax: 20000,
  elderlyResidentialCareMax: 100000,
  vhisPerInsuredPersonMax: 8000,
  assistedReproductiveServicesMax: 100000,
  donationsMaxRate: 0.35,
  voluntaryMpfAnnuityMax: 60000,
};

export const HK_TAX_REDUCTION_2026 = {
  rate: 1,
  cap: 3000,
};

export const HK_MPF_2026 = {
  rate: 0.05,
  minRelevantIncomeMonthly: 7100,
  maxRelevantIncomeMonthly: 30000,
  employeeMonthlyCap: 1500,
};

export const HK_HOUSING_BENEFIT_RATES = {
  residential: 0.1,
  hotelTwoRooms: 0.08,
  hotelOneRoom: 0.04,
} as const;
