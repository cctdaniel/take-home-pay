import { describe, expect, it } from "vitest";
import { MECalculator } from "./calculator";
import type { MEBreakdown, MECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<MECalculatorInputs> = {},
): MECalculatorInputs {
  return {
    country: "ME",
    grossSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "annual",
    incomeScenario: "montenegroPayroll",
    municipalSurtaxRate: "standard13",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

function calculateME(input: MECalculatorInputs) {
  return MECalculator.calculate(input);
}

describe("Montenegro calculator", () => {
  it("annualizes the 2026 monthly salary PIT bands and employee contributions", () => {
    const result = calculateME(inputs(12_000));
    const breakdown = result.breakdown as MEBreakdown;

    expect(result.taxableIncome).toBe(3_600);
    expect(result.taxes.incomeTax).toBe(324);
    expect(result.taxes.socialContributions).toBe(1_260);
    expect(result.netSalary).toBe(10_416);
    expect(breakdown.personalAllowance).toBe(8_400);
    expect(breakdown.municipalSurtaxEmployerCostEstimate).toBe(42.12);
  });

  it("adds taxable benefits in kind to PIT and contribution bases but not cash salary", () => {
    const result = calculateME(
      inputs(12_000, {
        taxableNonCashBenefits: 1_200,
      }),
    );
    const breakdown = result.breakdown as MEBreakdown;

    expect(breakdown.taxableGrossIncome).toBe(13_200);
    expect(result.grossSalary).toBe(12_000);
    expect(result.taxableIncome).toBe(4_800);
    expect(result.taxes.incomeTax).toBe(504);
    expect(result.taxes.socialContributions).toBe(1_386);
    expect(result.netSalary).toBe(10_110);
  });

  it("models qualifying digital-nomad foreign-source salary with no Montenegro payroll tax or contributions", () => {
    const result = calculateME(
      inputs(36_000, {
        incomeScenario: "digitalNomadForeignSource",
        taxableNonCashBenefits: 5_000,
      }),
    );
    const breakdown = result.breakdown as MEBreakdown;

    expect(result.taxableIncome).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(36_000);
    expect(breakdown.taxableNonCashBenefits).toBe(0);
  });
});
