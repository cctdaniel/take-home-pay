import type { TaxBracket } from "../../types";

// New Zealand salary and wage model for the 2026/27 PAYE year.
// Sources:
// - IRD individual rates from 1 April 2025:
//   https://www.ird.govt.nz/en/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals
// - IRD ACC earners' levy rates, including GST:
//   https://www.ird.govt.nz/acclevy
// - IRD KiwiSaver employee and employer contribution pages:
//   https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/employee-contributions
//   https://www.ird.govt.nz/kiwisaver/kiwisaver-for-employers/contributions-and-deductions/employer-contributions-to-kiwisaver-and-complying-funds
// - IRD independent earner tax credit:
//   https://www.ird.govt.nz/ietc
// - IRD student loan salary and wage repayments:
//   https://www.ird.govt.nz/en/student-loans/living-in-new-zealand-with-a-student-loan/repaying-my-student-loan-when-i-earn-salary-or-wages
// - IRD donation tax credits:
//   https://www.ird.govt.nz/donations

export const NZ_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 15_600, rate: 0.105 },
  { min: 15_600, max: 53_500, rate: 0.175 },
  { min: 53_500, max: 78_100, rate: 0.3 },
  { min: 78_100, max: 180_000, rate: 0.33 },
  { min: 180_000, max: Infinity, rate: 0.39 },
];

export const NZ_ACC_EARNERS_LEVY_2026 = {
  period: "1 April 2026 to 31 March 2027",
  rate: 0.0175,
  maximumEarnings: 156_641,
  maximumLevy: 2_741.22,
} as const;

export const NZ_STUDENT_LOAN_2026 = {
  repaymentRate: 0.12,
  annualThreshold: 24_128,
} as const;

export const NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026 = {
  minimumIncome: 24_000,
  fullCreditUpperIncome: 66_000,
  maximumIncome: 70_000,
  weeklyCredit: 10,
  annualMaximumCredit: 520,
  abatementRate: 0.13,
} as const;

export const NZ_DONATION_TAX_CREDIT_2026 = {
  creditRate: 1 / 3,
  minimumGift: 5,
} as const;

export const NZ_KIWISAVER_2026 = {
  standardEmployeeRates: [0.035, 0.04, 0.06, 0.08, 0.1],
  temporaryReducedEmployeeRate: 0.03,
  defaultEmployeeRate: 0.035,
  minimumEmployerRate: 0.035,
  temporaryReducedEmployerRate: 0.03,
} as const;

export function calculateNzProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = NZ_INCOME_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min,
    );

    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);
  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

export function calculateNzIndependentEarnerTaxCredit(
  income: number,
): number {
  if (
    income < NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.minimumIncome ||
    income > NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.maximumIncome
  ) {
    return 0;
  }

  if (income <= NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.fullCreditUpperIncome) {
    return NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.annualMaximumCredit;
  }

  return Math.max(
    0,
    NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.annualMaximumCredit -
      (income - NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.fullCreditUpperIncome) *
        NZ_INDEPENDENT_EARNER_TAX_CREDIT_2026.abatementRate,
  );
}
