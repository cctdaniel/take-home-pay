import { describe, expect, it } from "vitest";
import { NZCalculator } from "./calculator";
import type { NZBreakdown, NZCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<NZCalculatorInputs> = {},
): NZCalculatorInputs {
  return {
    country: "NZ",
    grossSalary,
    payFrequency: "annual",
    residencyType: "tax_resident",
    hasStudentLoan: false,
    claimsIndependentEarnerTaxCredit: false,
    claimsKiwiSaverGovernmentContribution: true,
    contributions: {
      kiwiSaverRate: "none",
      payrollGivingDonations: 0,
    },
    ...overrides,
    contributions: {
      kiwiSaverRate: "none",
      payrollGivingDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("New Zealand calculator", () => {
  it("calculates PAYE income tax and ACC earners levy using 2026/27 settings", () => {
    const result = NZCalculator.calculate(inputs(85_000));
    const breakdown = result.breakdown as NZBreakdown;

    expect(result.taxableIncome).toBe(85_000);
    expect(result.taxes.grossIncomeTax).toBe(17_927.5);
    expect(result.taxes.accEarnersLevy).toBe(1_487.5);
    expect(result.totalTax).toBe(19_415);
    expect(result.netSalary).toBe(65_585);
    expect(breakdown.kiwiSaver.employeeContribution).toBe(0);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.ird.govt.nz/en/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
        "https://www.ird.govt.nz/acclevy",
      ]),
    );
  });

  it("models IETC, student loan repayments, KiwiSaver, government contribution, and payroll giving", () => {
    const result = NZCalculator.calculate(
      inputs(65_000, {
        hasStudentLoan: true,
        claimsIndependentEarnerTaxCredit: true,
        contributions: {
          kiwiSaverRate: "rate_10",
          payrollGivingDonations: 10_000,
        },
      }),
    );
    const breakdown = result.breakdown as NZBreakdown;
    const limits = NZCalculator.getContributionLimits(inputs(65_000));

    expect(limits.payrollGivingDonations?.limit).toBe(65_000);
    expect(result.taxes).toEqual(
      expect.objectContaining({
        grossIncomeTax: 11_720.5,
        independentEarnerTaxCredit: 520,
        donationTaxCredit: 3_333.33,
        accEarnersLevy: 1_137.5,
        studentLoanRepayment: 4_904.64,
      }),
    );
    expect(breakdown.kiwiSaver).toEqual(
      expect.objectContaining({
        employeeRate: 0.1,
        employeeContribution: 6_500,
        employerRate: 0.035,
        employerContributionBeforeEsct: 2_275,
        governmentContribution: 260.72,
      }),
    );
    expect(breakdown.donations).toEqual(
      expect.objectContaining({
        payrollGivingDonations: 10_000,
        eligibleDonationAmount: 10_000,
        creditRate: 1 / 3,
      }),
    );
    expect(result.totalTax).toBe(13_909.31);
    expect(result.totalDeductions).toBe(30_409.31);
    expect(result.netSalary).toBe(34_590.69);
  });
});
