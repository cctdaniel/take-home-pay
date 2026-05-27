import { describe, expect, it } from "vitest";
import { CRCalculator } from "./calculator";
import type { CRBreakdown, CRCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CRCalculatorInputs> = {},
): CRCalculatorInputs {
  return {
    country: "CR",
    grossSalary,
    payFrequency: "annual",
    hasEligibleSpouse: false,
    numberOfChildren: 0,
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function calculateCR(input: CRCalculatorInputs) {
  return CRCalculator.calculate(input);
}

describe("Costa Rica calculator", () => {
  it("separates included legal aguinaldo from CCSS and salary income tax", () => {
    const result = calculateCR(inputs(30_000_000));
    const breakdown = result.breakdown as CRBreakdown;

    expect(result.grossSalary).toBe(30_000_000);
    expect(breakdown.regularTaxableSalary).toBe(27_692_307.69);
    expect(breakdown.aguinaldo).toBe(2_307_692.31);
    expect(result.taxableIncome).toBe(27_692_307.69);
    expect(result.taxes.incomeTax).toBe(2_244_046.15);
    expect(result.taxes.socialContributions).toBe(2_999_076.92);
    expect(result.totalTax).toBe(5_243_123.07);
    expect(result.netSalary).toBe(24_756_876.93);
  });

  it("applies spouse and child credits as non-refundable salary-tax credits", () => {
    const result = calculateCR(
      inputs(30_000_000, {
        hasEligibleSpouse: true,
        numberOfChildren: 2,
      }),
    );

    expect(result.taxes.incomeTax).toBe(2_171_926.15);
    expect(result.totalTax).toBe(5_171_003.07);
    expect(result.netSalary).toBe(24_828_996.93);
  });

  it("caps voluntary complementary pension at ten percent of regular taxable salary", () => {
    const limits = CRCalculator.getContributionLimits(inputs(30_000_000));
    const result = calculateCR(
      inputs(30_000_000, {
        contributions: {
          retirementContribution: 5_000_000,
          qualifyingExpenses: 0,
        },
      }),
    );
    const pension = (result.breakdown as CRBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    );

    expect(limits.retirementContribution?.limit).toBe(2_769_230.77);
    expect(pension?.amount).toBe(2_769_230.77);
    expect(result.taxableIncome).toBe(24_923_076.92);
    expect(result.taxes.incomeTax).toBe(1_828_661.54);
    expect(result.taxes.socialContributions).toBe(2_699_169.23);
    expect(result.totalTax).toBe(4_527_830.77);
    expect(result.totalDeductions).toBe(7_297_061.54);
    expect(result.netSalary).toBe(22_702_938.46);
  });

  it("adds legal aguinaldo on top of entered regular salary when selected", () => {
    const result = calculateCR(
      inputs(30_000_000, { aguinaldoMode: "additionalToGross" }),
    );
    const breakdown = result.breakdown as CRBreakdown;

    expect(result.grossSalary).toBe(32_500_000);
    expect(breakdown.regularTaxableSalary).toBe(30_000_000);
    expect(breakdown.aguinaldo).toBe(2_500_000);
    expect(result.taxes.incomeTax).toBe(2_671_800);
    expect(result.taxes.socialContributions).toBe(3_249_000);
    expect(result.totalTax).toBe(5_920_800);
    expect(result.netSalary).toBe(26_579_200);
  });
});
