import { describe, expect, it } from "vitest";
import { VNCalculator } from "./calculator";
import type { VNBreakdown, VNCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<VNCalculatorInputs> = {},
): VNCalculatorInputs {
  return {
    country: "VN",
    grossSalary,
    payFrequency: "annual",
    residencyStatus: "resident",
    insuranceCoverage: "vietnameseEmployee",
    numberOfDependents: 0,
    contributions: {
      voluntaryPensionContribution: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      voluntaryPensionContribution: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("Vietnam calculator", () => {
  it("calculates resident PIT after employee insurance and family deductions", () => {
    const result = VNCalculator.calculate(inputs(240_000_000));
    const breakdown = result.breakdown as VNBreakdown;

    expect(breakdown.personalDeduction).toBe(186_000_000);
    expect(breakdown.dependentDeduction).toBe(0);
    expect(result.taxableIncome).toBe(28_800_000);
    expect(result.taxes.incomeTax).toBe(1_440_000);
    expect(result.taxes.socialInsurance).toBe(19_200_000);
    expect(result.taxes.healthInsurance).toBe(3_600_000);
    expect(result.taxes.unemploymentInsurance).toBe(2_400_000);
    expect(result.totalTax).toBe(26_640_000);
    expect(result.netSalary).toBe(213_360_000);
  });

  it("caps resident voluntary pension and charity deductions to the remaining taxable salary base", () => {
    const result = VNCalculator.calculate(
      inputs(900_000_000, {
        numberOfDependents: 2,
        contributions: {
          voluntaryPensionContribution: 999_999_999,
          charitableDonations: 999_999_999,
        },
      }),
    );
    const breakdown = result.breakdown as VNBreakdown;
    const limits = VNCalculator.getContributionLimits(
      inputs(900_000_000, {
        numberOfDependents: 2,
        contributions: {
          voluntaryPensionContribution: 999_999_999,
        },
      }),
    );

    expect(limits.voluntaryPensionContribution?.limit).toBe(12_000_000);
    expect(limits.charitableDonations?.limit).toBe(490_848_000);
    expect(breakdown.dependentDeduction).toBe(148_800_000);
    expect(breakdown.voluntaryDeductions).toMatchObject({
      voluntaryPensionContribution: 12_000_000,
      charitableDonations: 490_848_000,
      total: 502_848_000,
    });
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(565_200_000);
    expect(result.netSalary).toBe(334_800_000);
  });

  it("uses non-resident gross employment tax and excludes unemployment insurance for covered foreign employees", () => {
    const result = VNCalculator.calculate(
      inputs(900_000_000, {
        residencyStatus: "nonResident",
        insuranceCoverage: "foreignCovered",
        numberOfDependents: 2,
        contributions: {
          voluntaryPensionContribution: 999_999_999,
          charitableDonations: 999_999_999,
        },
      }),
    );
    const breakdown = result.breakdown as VNBreakdown;
    const limits = VNCalculator.getContributionLimits(
      inputs(900_000_000, { residencyStatus: "nonResident" }),
    );

    expect(limits.voluntaryPensionContribution?.limit).toBe(0);
    expect(limits.charitableDonations?.limit).toBe(0);
    expect(breakdown.personalDeduction).toBe(0);
    expect(breakdown.dependentDeduction).toBe(0);
    expect(breakdown.unemploymentInsurance.employee).toBe(0);
    expect(result.taxableIncome).toBe(900_000_000);
    expect(result.taxes.incomeTax).toBe(180_000_000);
    expect(result.totalTax).toBe(233_352_000);
    expect(result.netSalary).toBe(666_648_000);
  });
});
