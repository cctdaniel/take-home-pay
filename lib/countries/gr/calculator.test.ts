import { describe, expect, it } from "vitest";
import { GRCalculator } from "./calculator";
import type { GRBreakdown, GRCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<GRCalculatorInputs> = {},
): GRCalculatorInputs {
  return {
    country: "GR",
    grossSalary,
    payFrequency: "annual",
    taxableBenefitsInKind: 0,
    taxRegime: "ordinary",
    residencyType: "resident",
    age: 31,
    numberOfDependents: 0,
    contributions: {
      occupationalPensionContribution: 0,
    },
    ...overrides,
    contributions: {
      occupationalPensionContribution: 0,
      ...overrides.contributions,
    },
  };
}

describe("Greece calculator", () => {
  it("applies ordinary resident employment tax after e-EFKA and the employment tax reduction", () => {
    const result = GRCalculator.calculate(inputs(24_000));
    const breakdown = result.breakdown as GRBreakdown;

    expect(breakdown.socialInsurance.employee).toBeCloseTo(3_208.8, 5);
    expect(result.taxableIncome).toBeCloseTo(20_791.2, 5);
    expect(breakdown.incomeTax.grossIncomeTax).toBeCloseTo(3_105.712, 5);
    expect(breakdown.incomeTax.availableTaxReduction).toBeCloseTo(601.176, 5);
    expect(result.taxes.incomeTax).toBeCloseTo(2_504.536, 5);
    expect(result.totalTax).toBeCloseTo(5_713.336, 5);
    expect(result.netSalary).toBeCloseTo(18_286.664, 5);
  });

  it("applies youth and dependent-child bracket reductions for eligible residents", () => {
    const result = GRCalculator.calculate(
      inputs(30_000, {
        age: 24,
        numberOfDependents: 2,
      }),
    );
    const breakdown = result.breakdown as GRBreakdown;

    expect(breakdown.effectiveAgeForScale).toBe(24);
    expect(breakdown.effectiveDependentsForScale).toBe(2);
    expect(result.taxableIncome).toBeCloseTo(25_989, 5);
    expect(breakdown.incomeTax.grossIncomeTax).toBeCloseTo(1_317.58, 5);
    expect(result.taxes.incomeTax).toBeCloseTo(477.36, 5);
    expect(result.totalTax).toBeCloseTo(4_488.36, 5);
    expect(result.netSalary).toBeCloseTo(25_511.64, 5);
  });

  it("models Article 5C new-resident relief and occupational pension deductions", () => {
    const limits = GRCalculator.getContributionLimits(inputs(100_000));
    const result = GRCalculator.calculate(
      inputs(100_000, {
        taxableBenefitsInKind: 5_000,
        taxRegime: "article_5c_new_resident",
        contributions: {
          occupationalPensionContribution: 10_000,
        },
      }),
    );
    const breakdown = result.breakdown as GRBreakdown;

    expect(limits.occupationalPensionContribution?.limit).toBe(20_000);
    expect(breakdown.article5CRelief.applies).toBe(true);
    expect(breakdown.article5CRelief.exemptIncome).toBeCloseTo(40_480.75, 5);
    expect(result.taxableIncome).toBeCloseTo(40_480.75, 5);
    expect(result.taxes.incomeTax).toBeCloseTo(8_880.1075, 5);
    expect(result.totalDeductions).toBeCloseTo(32_918.6075, 5);
    expect(result.netSalary).toBeCloseTo(67_081.3925, 5);
  });

  it("removes resident reductions and voluntary pension deductions for non-residents", () => {
    const result = GRCalculator.calculate(
      inputs(24_000, {
        residencyType: "non_resident",
        numberOfDependents: 3,
        contributions: {
          occupationalPensionContribution: 4_800,
        },
      }),
    );
    const breakdown = result.breakdown as GRBreakdown;

    expect(breakdown.effectiveDependentsForScale).toBe(0);
    expect(breakdown.voluntaryContributions.occupationalPension).toBe(0);
    expect(breakdown.incomeTax.appliedTaxReduction).toBe(0);
    expect(result.taxes.incomeTax).toBeCloseTo(3_105.712, 5);
    expect(result.totalTax).toBeCloseTo(6_314.512, 5);
    expect(result.netSalary).toBeCloseTo(17_685.488, 5);
  });
});
