import { describe, expect, it } from "vitest";
import { BMCalculator } from "./calculator";
import type { BMBreakdown, BMCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BMCalculatorInputs> = {},
): BMCalculatorInputs {
  return {
    country: "BM",
    grossSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "annual",
    payrollTaxDeducted: true,
    socialInsuranceCovered: true,
    occupationalPensionTreatment: "employeeDeducted",
    nonWorkingSpouseHealthCoverage: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 2_637.3,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 2_637.3,
      ...overrides.contributions,
    },
  };
}

describe("Bermuda calculator", () => {
  it("calculates 2026 employee payroll tax, social insurance, occupational pension, and health deduction", () => {
    const result = BMCalculator.calculate(inputs(100_000));
    const breakdown = result.breakdown as BMBreakdown;

    expect(result.taxableIncome).toBe(100_000);
    expect(result.taxes.incomeTax).toBe(4_270);
    expect(result.taxes.socialContributions).toBe(6_957.8);
    expect(result.totalTax).toBe(11_227.8);
    expect(result.totalDeductions).toBe(13_865.1);
    expect(result.netSalary).toBe(86_134.9);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Employee social insurance contribution",
          amount: 1_957.8,
        }),
        expect.objectContaining({
          name: "Occupational pension employee contribution",
          amount: 5_000,
          rate: 0.05,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "insurancePremiums",
        amount: 2_637.3,
        limit: 2_637.3,
      }),
    ]);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.gov.bm/payroll-tax",
        "https://www.gov.bm/calculating-payroll-tax-2026",
      ]),
    );
  });

  it("adds taxable non-cash benefits to payroll-tax base but not cash gross pay", () => {
    const result = BMCalculator.calculate(
      inputs(100_000, {
        taxableNonCashBenefits: 50_000,
        occupationalPensionTreatment: "employerPaidEmployeeShare",
        nonWorkingSpouseHealthCoverage: true,
        contributions: {
          insurancePremiums: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as BMBreakdown;
    const limits = BMCalculator.getContributionLimits(
      inputs(100_000, { nonWorkingSpouseHealthCoverage: true }),
    );

    expect(limits.insurancePremiums?.limit).toBe(5_274.6);
    expect(result.grossSalary).toBe(100_000);
    expect(breakdown.taxableNonCashBenefits).toBe(50_000);
    expect(breakdown.taxableGrossIncome).toBe(150_000);
    expect(result.taxableIncome).toBe(150_000);
    expect(result.taxes.incomeTax).toBe(9_645);
    expect(result.taxes.socialContributions).toBe(1_957.8);
    expect(breakdown.mandatoryContributions).toHaveLength(1);
    expect(breakdown.voluntaryContributions[0]).toEqual(
      expect.objectContaining({
        key: "insurancePremiums",
        amount: 5_274.6,
        limit: 5_274.6,
      }),
    );
    expect(result.netSalary).toBe(83_122.6);
  });

  it("allows payroll tax, social insurance, pension, and health deductions to be switched off when not deducted from pay", () => {
    const result = BMCalculator.calculate(
      inputs(100_000, {
        payrollTaxDeducted: false,
        socialInsuranceCovered: false,
        occupationalPensionTreatment: "notCovered",
        contributions: {
          insurancePremiums: 0,
        },
      }),
    );
    const breakdown = result.breakdown as BMBreakdown;

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.netSalary).toBe(100_000);
    expect(breakdown.mandatoryContributions).toEqual([]);
    expect(breakdown.voluntaryContributions[0]).toEqual(
      expect.objectContaining({ amount: 0, limit: 2_637.3 }),
    );
  });
});
