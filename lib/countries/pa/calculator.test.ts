import { describe, expect, it } from "vitest";
import { PACalculator } from "./calculator";
import type { PACalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<PACalculatorInputs> = {},
): PACalculatorInputs {
  return {
    country: "PA",
    grossSalary,
    payFrequency: "annual",
    isMarried: false,
    educationStudents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
  };
}

describe("Panama calculator", () => {
  it("caps approved retirement fund deductions at the lower of 10% of gross salary or USD 15,000", () => {
    expect(
      PACalculator.getContributionLimits(inputs(60_000))
        .retirementContribution?.limit,
    ).toBe(6_000);
    expect(
      PACalculator.getContributionLimits(inputs(200_000))
        .retirementContribution?.limit,
    ).toBe(15_000);
  });

  it("applies the DGI resident salary brackets and payroll contribution rates", () => {
    const result = PACalculator.calculate(inputs(60_000));

    expect(result.taxes.incomeTax).toBe(6_700);
    expect(result.taxes.socialContributions).toBe(6_600);
    expect(result.netSalary).toBe(46_700);
  });
});
