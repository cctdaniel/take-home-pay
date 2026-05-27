// ============================================================================
// GEORGIA TAX CONSTANTS
// Tax Year: 2026
// ============================================================================

// Official sources used for the 2026 ordinary employment salary model:
// - Georgia Revenue Service Tax Code PDF, Article 81(1): a natural person's
//   taxable income is taxed at 20%.
//   https://www.rs.ge/Media/Default/%E1%83%99%E1%83%90%E1%83%9C%E1%83%9D%E1%83%9C%E1%83%9B%E1%83%93%E1%83%94%E1%83%91%E1%83%9A%E1%83%9D%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9C%E1%83%9D%E1%83%9C%E1%83%94%E1%83%91%E1%83%98/tax%20code.pdf
// - Georgia Revenue Service Tax Code PDF, Article 103(1)(d): employer funded
//   pension contributions made for an employee are excluded from gross income.
//   Same source URL as above.
// - Pension Agency financial statements, Note 3(a)(ii): 2% employee, 2%
//   employer, and one state contribution rate determined by annual salary:
//   2% up to GEL 24,000, 1% from GEL 24,000 to GEL 60,000, and 0% above GEL
//   60,000.
//   https://site-api.pensions.ge/uploads/docs/reports/financial-statements/2019-IFRS.pdf
// - Law of Georgia on Funded Pension, Article 3: mandatory employee
//   participation rules and contribution rates.
//   https://www.matsne.gov.ge/en/document/view/4280127?publication=7
// - Tax Code of Georgia, Articles 84-90: micro business status applies up to
//   GEL 30,000 gross income with no income tax; small business status is taxed
//   at 1%, or 3% from the beginning of the month in which the GEL 500,000
//   annual gross-income threshold is exceeded.
//   https://www.matsne.gov.ge/en/document/view/1043717?publication=233

export const GE_SOURCE_URLS = [
  "https://www.rs.ge/Media/Default/%E1%83%99%E1%83%90%E1%83%9C%E1%83%9D%E1%83%9C%E1%83%9B%E1%83%93%E1%83%94%E1%83%91%E1%83%9A%E1%83%9D%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9C%E1%83%9D%E1%83%9C%E1%83%94%E1%83%91%E1%83%98/tax%20code.pdf",
  "https://www.matsne.gov.ge/en/document/view/4280127?publication=7",
  "https://www.matsne.gov.ge/en/document/view/1043717?publication=233",
] as const;

export const GE_INCOME_TAX_2026 = {
  rate: 0.2,
};

export const GE_MICRO_BUSINESS_2026 = {
  incomeLimit: 30_000,
  rate: 0,
};

export const GE_SMALL_BUSINESS_2026 = {
  incomeLimit: 500_000,
  standardRate: 0.01,
  overLimitRate: 0.03,
  monthsPerYear: 12,
};

export const GE_PENSION_2026 = {
  employeeRate: 0.02,
  employerRate: 0.02,
  stateFirstBandLimit: 24_000,
  stateSecondBandLimit: 60_000,
  stateFirstBandRate: 0.02,
  stateSecondBandRate: 0.01,
  stateAboveSecondBandRate: 0,
};

export const GE_MODELED_EXCLUSIONS_2026 = [
  "Activity eligibility checks for small or micro business status",
  "VAT registration, monthly filing penalties, and bookkeeping compliance for individual entrepreneurs",
  "Self-employed voluntary funded pension contributions",
  "Tax exemptions or allowances for special personal circumstances",
];

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateGeorgiaStatePensionContribution(
  annualTaxableSalary: number,
): {
  contributionSalary: number;
  rate: number;
  firstBandContributionSalary: number;
  secondBandContributionSalary: number;
  total: number;
} {
  const salary = Math.max(0, annualTaxableSalary);
  const firstBandContributionSalary = Math.min(
    salary,
    GE_PENSION_2026.stateFirstBandLimit,
  );
  const secondBandContributionSalary = Math.min(
    Math.max(0, salary - GE_PENSION_2026.stateFirstBandLimit),
    GE_PENSION_2026.stateSecondBandLimit -
      GE_PENSION_2026.stateFirstBandLimit,
  );
  const total = roundCurrency(
    firstBandContributionSalary * GE_PENSION_2026.stateFirstBandRate +
      secondBandContributionSalary * GE_PENSION_2026.stateSecondBandRate,
  );

  return {
    contributionSalary: Math.min(salary, GE_PENSION_2026.stateSecondBandLimit),
    rate: salary > 0 ? total / salary : 0,
    firstBandContributionSalary: roundCurrency(firstBandContributionSalary),
    secondBandContributionSalary: roundCurrency(secondBandContributionSalary),
    total,
  };
}

export function calculateGeorgiaSmallBusinessTax(
  annualGrossIncome: number,
  thresholdTreatment: "even_monthly" | "three_percent_full_year",
): {
  tax: number;
  standardRateIncome: number;
  overLimitRateIncome: number;
  effectiveRate: number;
} {
  const income = Math.max(0, annualGrossIncome);

  if (income <= GE_SMALL_BUSINESS_2026.incomeLimit) {
    return {
      tax: roundCurrency(income * GE_SMALL_BUSINESS_2026.standardRate),
      standardRateIncome: income,
      overLimitRateIncome: 0,
      effectiveRate: income > 0 ? GE_SMALL_BUSINESS_2026.standardRate : 0,
    };
  }

  if (thresholdTreatment === "three_percent_full_year") {
    const tax = roundCurrency(income * GE_SMALL_BUSINESS_2026.overLimitRate);

    return {
      tax,
      standardRateIncome: 0,
      overLimitRateIncome: income,
      effectiveRate: income > 0 ? tax / income : 0,
    };
  }

  const monthlyIncome = income / GE_SMALL_BUSINESS_2026.monthsPerYear;
  let cumulativeIncome = 0;
  let standardRateIncome = 0;
  let overLimitRateIncome = 0;

  for (let month = 0; month < GE_SMALL_BUSINESS_2026.monthsPerYear; month++) {
    const nextCumulativeIncome = cumulativeIncome + monthlyIncome;

    if (nextCumulativeIncome > GE_SMALL_BUSINESS_2026.incomeLimit) {
      overLimitRateIncome += monthlyIncome;
    } else {
      standardRateIncome += monthlyIncome;
    }

    cumulativeIncome = nextCumulativeIncome;
  }

  const tax = roundCurrency(
    standardRateIncome * GE_SMALL_BUSINESS_2026.standardRate +
      overLimitRateIncome * GE_SMALL_BUSINESS_2026.overLimitRate,
  );

  return {
    tax,
    standardRateIncome: roundCurrency(standardRateIncome),
    overLimitRateIncome: roundCurrency(overLimitRateIncome),
    effectiveRate: income > 0 ? tax / income : 0,
  };
}
