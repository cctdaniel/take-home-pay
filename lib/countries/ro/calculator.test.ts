import { describe, expect, it } from "vitest";
import { ROCalculator } from "./calculator";
import type { ROBreakdown, ROCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ROCalculatorInputs> = {},
): ROCalculatorInputs {
  return {
    country: "RO",
    grossSalary,
    payFrequency: "annual",
    claimPersonalDeduction: true,
    dependentCount: 0,
    ageUnder26: false,
    schoolChildren: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      unionFees: 0,
      sportsSubscriptions: 0,
      investmentSubscriptions: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      unionFees: 0,
      sportsSubscriptions: 0,
      investmentSubscriptions: 0,
      ...overrides.contributions,
    },
  };
}

describe("Romania calculator", () => {
  it("applies 2026 personal deductions, under-26 supplement, school-child deduction, and employee-paid relief caps", () => {
    const result = ROCalculator.calculate(
      inputs(54_000, {
        dependentCount: 4,
        ageUnder26: true,
        schoolChildren: 2,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          insurancePremiums: 999_999,
          unionFees: 1_200,
          sportsSubscriptions: 999_999,
          investmentSubscriptions: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as ROBreakdown;
    const limits = ROCalculator.getContributionLimits(inputs(54_000));

    expect(limits.retirementContribution?.limit).toBe(1_990);
    expect(limits.insurancePremiums?.limit).toBe(1_990);
    expect(limits.unionFees?.limit).toBe(Infinity);
    expect(limits.sportsSubscriptions?.limit).toBe(497.5);
    expect(limits.investmentSubscriptions?.limit).toBe(1_990);
    expect(breakdown.personalDeductionDetails).toEqual({
      basicPersonalDeduction: 22_545,
      youngEmployeeDeduction: 7_537.5,
      schoolChildDeduction: 2_400,
      total: 32_482.5,
    });
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "retirementContribution", amount: 1_990 }),
        expect.objectContaining({ key: "insurancePremiums", amount: 1_990 }),
        expect.objectContaining({ key: "unionFees", amount: 1_200 }),
        expect.objectContaining({ key: "sportsSubscriptions", amount: 497.5 }),
        expect.objectContaining({ key: "investmentSubscriptions", amount: 1_990 }),
      ]),
    );
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(26_567.5);
    expect(result.netSalary).toBe(27_432.5);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://static.anaf.ro/static/10/Anaf/legislatie/Cod_fiscal_norme_2023.htm",
        "https://taxsummaries.pwc.com/romania/individual/deductions",
      ]),
    );
  });

  it("phases out the basic personal deduction at higher salaries while preserving school-child and voluntary deductions", () => {
    const result = ROCalculator.calculate(
      inputs(180_000, {
        dependentCount: 4,
        ageUnder26: true,
        schoolChildren: 2,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          insurancePremiums: 999_999,
          unionFees: 1_200,
          sportsSubscriptions: 999_999,
          investmentSubscriptions: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as ROBreakdown;

    expect(breakdown.personalDeductionDetails).toEqual({
      basicPersonalDeduction: 0,
      youngEmployeeDeduction: 0,
      schoolChildDeduction: 2_400,
      total: 2_400,
    });
    expect(result.taxableIncome).toBe(106_932.5);
    expect(result.taxes.incomeTax).toBe(10_693.25);
    expect(result.taxes.socialContributions).toBe(63_000);
    expect(result.totalDeductions).toBe(81_360.75);
    expect(result.netSalary).toBe(98_639.25);
  });
});
