import { describe, expect, it } from "vitest";
import { COCalculator } from "./calculator";
import type { COBreakdown, COCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<COCalculatorInputs> = {},
): COCalculatorInputs {
  return {
    country: "CO",
    grossSalary,
    payFrequency: "annual",
    numberOfDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      housingExpenses: 0,
    },
    ...overrides,
  };
}

function reliefAmount(breakdown: COBreakdown, name: string) {
  return (
    breakdown.deductions.find((deduction) => deduction.name === name)?.amount ??
    0
  );
}

describe("Colombia calculator", () => {
  it("exposes all modeled deduction limits used by the country UI", () => {
    const limits = COCalculator.getContributionLimits(inputs(180_000_000));

    expect(limits.retirementContribution?.limit).toBeGreaterThan(0);
    expect(limits.insurancePremiums?.limit).toBeGreaterThan(0);
    expect(limits.housingExpenses?.limit).toBeGreaterThan(0);
    expect(limits.qualifyingExpenses?.limit).toBeGreaterThan(0);
    expect(limits.retirementContribution?.name).toBe(
      "Voluntary pension or AFC savings",
    );
    expect(limits.insurancePremiums?.name).toBe(
      "Prepaid medicine or health insurance",
    );
    expect(limits.housingExpenses?.name).toBe("Housing loan interest");
    expect(limits.qualifyingExpenses?.name).toBe(
      "Electronic invoice deduction",
    );
  });

  it("applies health, housing, electronic-invoice, dependent, and pension deductions", () => {
    const base = COCalculator.calculate(inputs(180_000_000));
    const withDeductions = COCalculator.calculate(
      inputs(180_000_000, {
        numberOfDependents: 2,
        contributions: {
          retirementContribution: 1_000_000,
          insurancePremiums: 1_000_000,
          housingExpenses: 1_000_000,
          qualifyingExpenses: 3_000_000,
        },
      }),
    );
    const breakdown = withDeductions.breakdown as COBreakdown;

    expect(withDeductions.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withDeductions.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(reliefAmount(breakdown, "Article 387 dependent deduction")).toBeGreaterThan(0);
    expect(reliefAmount(breakdown, "Article 336 dependent deduction")).toBeGreaterThan(0);
    expect(reliefAmount(breakdown, "Prepaid medicine or health insurance")).toBe(1_000_000);
    expect(reliefAmount(breakdown, "Housing loan interest")).toBe(1_000_000);
    expect(reliefAmount(breakdown, "Electronic invoice deduction")).toBe(3_000_000);
    expect(
      breakdown.voluntaryContributions.find(
        (contribution) => contribution.key === "retirementContribution",
      )?.amount,
    ).toBe(1_000_000);
  });
});
