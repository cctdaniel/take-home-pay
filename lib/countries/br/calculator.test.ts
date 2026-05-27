import { describe, expect, it } from "vitest";
import { BRCalculator } from "./calculator";
import type { BRBreakdown, BRCalculatorInputs, BRTaxBreakdown } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BRCalculatorInputs> = {},
): BRCalculatorInputs {
  return {
    country: "BR",
    grossSalary,
    payFrequency: "annual",
    numberOfDependents: 0,
    salaryPackageMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Brazil calculator", () => {
  it("calculates 2026 IRPF, INSS, low-income reduction, and included 13th salary", () => {
    const result = BRCalculator.calculate(inputs(180_000));
    const breakdown = result.breakdown as BRBreakdown;
    const taxes = result.taxes as BRTaxBreakdown;

    expect(result.grossSalary).toBe(180_000);
    expect(breakdown.ordinarySalary).toBe(166_153.85);
    expect(breakdown.thirteenthSalary).toBe(13_846.15);
    expect(result.taxableIncome).toBe(148_513.85);
    expect(taxes.incomeTax).toBe(32_563.9);
    expect(taxes.socialContributions).toBe(12_845.19);
    expect(taxes.thirteenthSalaryIncomeTax).toBe(2_627.25);
    expect(taxes.thirteenthSalaryInssContribution).toBe(988.09);
    expect(result.totalTax).toBe(45_409.09);
    expect(result.netSalary).toBe(134_590.91);
  });

  it("caps PGBL and education deductions, keeps medical expenses uncapped, and adds 13th salary on top", () => {
    const result = BRCalculator.calculate(
      inputs(240_000, {
        numberOfDependents: 2,
        salaryPackageMode: "additionalToGross",
        contributions: {
          retirementContribution: 999_999,
          educationExpenses: 999_999,
          medicalExpenses: 50_000,
        },
      }),
    );
    const breakdown = result.breakdown as BRBreakdown;
    const limits = BRCalculator.getContributionLimits(
      inputs(240_000, {
        numberOfDependents: 2,
        salaryPackageMode: "additionalToGross",
      }),
    );

    expect(limits.retirementContribution?.limit).toBe(28_800);
    expect(limits.educationExpenses?.limit).toBe(10_684.5);
    expect(limits.medicalExpenses?.limit).toBe(Infinity);
    expect(result.grossSalary).toBe(260_000);
    expect(breakdown.thirteenthSalary).toBe(20_000);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 28_800,
          limit: 28_800,
        }),
        expect.objectContaining({
          key: "educationExpenses",
          amount: 10_684.5,
          limit: 10_684.5,
        }),
        expect.objectContaining({
          key: "medicalExpenses",
          amount: 50_000,
          limit: Infinity,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(134_108.24);
    expect(result.totalDeductions).toBe(132_520.08);
    expect(result.netSalary).toBe(127_479.92);
  });
});
