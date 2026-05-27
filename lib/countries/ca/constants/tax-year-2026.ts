import type { TaxBracket } from "../../types";

export const CANADA_TAX_YEAR = 2026;

export const CANADA_FEDERAL_CREDIT_RATE_2026 = 0.14;

export const CANADA_FEDERAL_BASIC_PERSONAL_AMOUNT_2026 = {
  maximumAmount: 16_452,
  minimumAmount: 14_829,
  phaseoutStart: 181_440,
  phaseoutEnd: 258_482,
};

export const CANADA_EMPLOYMENT_AMOUNT_2026 = 1_501;
export const CANADA_QUEBEC_ABATEMENT_RATE_2026 = 0.165;
export const CANADA_CPP_BASE_EMPLOYEE_RATE_2026 = 0.0495;
export const CANADA_QPP_BASE_EMPLOYEE_RATE_2026 = 0.053;

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
    { min: 106_890, max: 142_520, rate: 0.1762 },
    { min: 142_520, max: Infinity, rate: 0.19 },
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

export const CANADA_PROVINCIAL_BASIC_PERSONAL_AMOUNTS_2026: Record<
  CanadaProvinceCode,
  number
> = {
  AB: 22_769,
  BC: 13_216,
  MB: 15_780,
  NB: 13_664,
  NL: 11_188,
  NS: 11_932,
  NT: 18_198,
  NU: 19_659,
  ON: 12_989,
  PE: 15_000,
  QC: 18_952,
  SK: 20_381,
  YT: CANADA_FEDERAL_BASIC_PERSONAL_AMOUNT_2026.maximumAmount,
};

export const CANADA_MANITOBA_BASIC_PERSONAL_AMOUNT_2026 = {
  maximumAmount: 15_780,
  phaseoutStart: 200_000,
  phaseoutEnd: 400_000,
};

export const CANADA_QUEBEC_DEPENDANT_AMOUNT_2026 = 5_684;

export const CANADA_QUEBEC_WORKERS_DEDUCTION_2026 = {
  rate: 0.06,
  maximum: 1_450,
};

export const CANADA_CHILDCARE_EXPENSE_LIMITS_2026 = {
  under7: 8_000,
  age7To16: 5_000,
  disabled: 11_000,
  earnedIncomeRate: 2 / 3,
};

export const ONTARIO_SURTAX_2026 = {
  firstThreshold: 5_818,
  firstRate: 0.2,
  secondThreshold: 7_446,
  secondRate: 0.36,
};

export const ONTARIO_HEALTH_PREMIUM_2026 = {
  firstThreshold: 20_000,
  firstBase: 0,
  firstIncrementRate: 0.06,
  firstIncrementCap: 5_000,
  secondThreshold: 36_000,
  secondBase: 300,
  secondIncrementRate: 0.06,
  secondIncrementCap: 2_500,
  thirdThreshold: 48_000,
  thirdBase: 450,
  thirdIncrementRate: 0.25,
  thirdIncrementCap: 600,
  fourthThreshold: 72_000,
  fourthBase: 600,
  fourthIncrementRate: 0.25,
  fourthIncrementCap: 600,
  fifthThreshold: 200_000,
  fifthBase: 750,
  fifthIncrementRate: 0.25,
  fifthIncrementCap: 600,
  maximum: 900,
};

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

export const CANADA_FHSA_2026 = {
  annualDollarLimit: 8_000,
};

export const CANADA_RPP_2026 = {
  modeledContributionRateLimit: 0.18,
  moneyPurchaseDollarLimit: 35_390,
};

type CanadaDonationCreditRate = {
  firstRate: number;
  overRate: number;
  topRate?: number;
  topThreshold?: number;
};

export const CANADA_CHARITABLE_DONATION_CREDIT_2026: {
  firstAmount: number;
  federalFirstRate: number;
  federalOverRate: number;
  federalHighIncomeRate: number;
  netIncomeLimitRate: number;
  provincialRates: Record<CanadaProvinceCode, CanadaDonationCreditRate>;
} = {
  firstAmount: 200,
  federalFirstRate: CANADA_FEDERAL_CREDIT_RATE_2026,
  federalOverRate: 0.29,
  federalHighIncomeRate: 0.33,
  netIncomeLimitRate: 0.75,
  provincialRates: {
    AB: { firstRate: 0.60, overRate: 0.21 },
    BC: { firstRate: 0.0506, overRate: 0.168, topRate: 0.205, topThreshold: 265_545 },
    MB: { firstRate: 0.108, overRate: 0.174 },
    NB: { firstRate: 0.094, overRate: 0.1795 },
    NL: { firstRate: 0.087, overRate: 0.218 },
    NS: { firstRate: 0.0879, overRate: 0.21 },
    NT: { firstRate: 0.059, overRate: 0.1405 },
    NU: { firstRate: 0.04, overRate: 0.115 },
    ON: { firstRate: 0.0505, overRate: 0.1116 },
    PE: { firstRate: 0.095, overRate: 0.19 },
    QC: { firstRate: 0.20, overRate: 0.24, topRate: 0.2575, topThreshold: 132_245 },
    SK: { firstRate: 0.105, overRate: 0.145 },
    YT: { firstRate: 0.064, overRate: 0.128 },
  },
};

function roundCanadaCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCanadaCharitableDonationLimit({
  grossSalary,
  province,
  rrspContribution,
  fhsaContribution,
  registeredPensionContribution,
  unionDues,
  childcareExpenses,
}: {
  grossSalary: number;
  province: CanadaProvinceCode;
  rrspContribution: number;
  fhsaContribution: number;
  registeredPensionContribution: number;
  unionDues: number;
  childcareExpenses: number;
}): number {
  const pensionPlan = province === "QC" ? CANADA_QPP_2026 : CANADA_CPP_2026;
  const basePensionRate =
    province === "QC"
      ? CANADA_QPP_BASE_EMPLOYEE_RATE_2026
      : CANADA_CPP_BASE_EMPLOYEE_RATE_2026;
  const pensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, pensionPlan.maximumPensionableEarnings) -
      pensionPlan.basicExemption,
  );
  const basePension = Math.min(
    pensionPlan.maximumEmployeeContribution,
    roundCanadaCurrency(pensionableEarnings * pensionPlan.employeeRate),
  );
  const additionalPensionableEarnings = Math.max(
    0,
    Math.min(grossSalary, pensionPlan.maximumAdditionalPensionableEarnings) -
      pensionPlan.maximumPensionableEarnings,
  );
  const secondAdditionalPension = Math.min(
    pensionPlan.maximumSecondAdditionalEmployeeContribution,
    roundCanadaCurrency(
      additionalPensionableEarnings *
        pensionPlan.secondAdditionalEmployeeRate,
    ),
  );
  const basePensionCreditAmount = roundCanadaCurrency(
    basePension * (basePensionRate / pensionPlan.employeeRate),
  );
  const enhancedPensionDeduction = roundCanadaCurrency(
    Math.max(0, basePension - basePensionCreditAmount) +
      secondAdditionalPension,
  );
  const preDonationNetIncome = Math.max(
    0,
    grossSalary -
      rrspContribution -
      fhsaContribution -
      registeredPensionContribution -
      unionDues -
      childcareExpenses -
      enhancedPensionDeduction,
  );

  return roundCanadaCurrency(
    preDonationNetIncome *
      CANADA_CHARITABLE_DONATION_CREDIT_2026.netIncomeLimitRate,
  );
}

export function calculateCanadaFederalBasicPersonalAmount(
  taxableIncome: number,
): number {
  const {
    maximumAmount,
    minimumAmount,
    phaseoutStart,
    phaseoutEnd,
  } = CANADA_FEDERAL_BASIC_PERSONAL_AMOUNT_2026;

  if (taxableIncome <= phaseoutStart) {
    return maximumAmount;
  }

  if (taxableIncome >= phaseoutEnd) {
    return minimumAmount;
  }

  const phaseoutRatio =
    (taxableIncome - phaseoutStart) / (phaseoutEnd - phaseoutStart);
  return Math.round(
    (maximumAmount - (maximumAmount - minimumAmount) * phaseoutRatio) * 100,
  ) / 100;
}

export function calculateCanadaProvincialBasicPersonalAmount({
  province,
  taxableIncome,
}: {
  province: CanadaProvinceCode;
  taxableIncome: number;
}): number {
  if (province === "YT") {
    return calculateCanadaFederalBasicPersonalAmount(taxableIncome);
  }

  if (province === "MB") {
    const { maximumAmount, phaseoutStart, phaseoutEnd } =
      CANADA_MANITOBA_BASIC_PERSONAL_AMOUNT_2026;

    if (taxableIncome <= phaseoutStart) {
      return maximumAmount;
    }

    if (taxableIncome >= phaseoutEnd) {
      return 0;
    }

    const phaseoutRatio =
      (taxableIncome - phaseoutStart) / (phaseoutEnd - phaseoutStart);
    return Math.round(maximumAmount * (1 - phaseoutRatio) * 100) / 100;
  }

  return CANADA_PROVINCIAL_BASIC_PERSONAL_AMOUNTS_2026[province];
}

export function calculateCanadaChildcareLimit({
  grossSalary,
  numberOfChildrenUnder7,
  numberOfChildrenAge7To16,
  numberOfDisabledChildren,
}: {
  grossSalary: number;
  numberOfChildrenUnder7: number;
  numberOfChildrenAge7To16: number;
  numberOfDisabledChildren: number;
}): number {
  const childLimit =
    Math.max(0, numberOfChildrenUnder7) *
      CANADA_CHILDCARE_EXPENSE_LIMITS_2026.under7 +
    Math.max(0, numberOfChildrenAge7To16) *
      CANADA_CHILDCARE_EXPENSE_LIMITS_2026.age7To16 +
    Math.max(0, numberOfDisabledChildren) *
      CANADA_CHILDCARE_EXPENSE_LIMITS_2026.disabled;

  const earnedIncomeLimit =
    Math.max(0, grossSalary) * CANADA_CHILDCARE_EXPENSE_LIMITS_2026.earnedIncomeRate;

  return Math.min(childLimit, earnedIncomeLimit);
}

export const CANADA_SOURCE_URLS = [
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan.html",
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/registered-plans-administrators/pspa/mp-rrsp-dpsp-tfsa-limits-ympe.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/benefits-allowances-chart.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/contributing-your-fhsa.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family-unit-issues/income-tax-folio-s1-f3-c1-child-care-expense-deduction.html",
  "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-34900-donations-gifts.html",
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/ontario/5006-c.html",
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/british-columbia/5010-d.html",
  "https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/how-to-complete-your-income-tax-return/line-by-line-help/350-to-398-1-non-refundable-tax-credits/line-395/",
  "https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/employers-principal-changes-for-2026/",
  "https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/conditions-for-making-source-deductions-and-paying-contributions/types-of-remuneration-subject-to-source-deductions-and-contributions/",
  "https://www.ontario.ca/laws/statute/07t11",
  "https://www.rqap-lois.gouv.qc.ca/en/news/premium-rates-and-maximum-insurable-earnings-for-2026",
];
