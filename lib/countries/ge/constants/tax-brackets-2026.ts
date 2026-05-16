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
//   employer, and state contributions at 2% up to GEL 24,000, 1% from GEL
//   24,000 to GEL 60,000, and 0% above GEL 60,000.
//   https://site-api.pensions.ge/uploads/docs/reports/financial-statements/2019-IFRS.pdf
// - Law of Georgia on Funded Pension, Article 3: mandatory employee
//   participation rules and contribution rates.
//   https://www.matsne.gov.ge/en/document/view/4280127?publication=7

export const GE_INCOME_TAX_2026 = {
  rate: 0.2,
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
  "Small business and micro business special tax regimes",
  "Individual entrepreneur business income",
  "Self-employed voluntary funded pension contributions",
  "Tax exemptions or allowances for special personal circumstances",
];

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateGeorgiaStatePensionContribution(
  annualTaxableSalary: number,
): {
  firstBandContribution: number;
  secondBandContribution: number;
  total: number;
} {
  const salary = Math.max(0, annualTaxableSalary);
  const firstBandSalary = Math.min(salary, GE_PENSION_2026.stateFirstBandLimit);
  const secondBandSalary = Math.min(
    Math.max(0, salary - GE_PENSION_2026.stateFirstBandLimit),
    GE_PENSION_2026.stateSecondBandLimit -
      GE_PENSION_2026.stateFirstBandLimit,
  );

  const firstBandContribution = roundCurrency(
    firstBandSalary * GE_PENSION_2026.stateFirstBandRate,
  );
  const secondBandContribution = roundCurrency(
    secondBandSalary * GE_PENSION_2026.stateSecondBandRate,
  );

  return {
    firstBandContribution,
    secondBandContribution,
    total: roundCurrency(firstBandContribution + secondBandContribution),
  };
}
