import { describe, expect, it } from "vitest";
import { DECalculator } from "./calculator";
import type { DEBreakdown, DECalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<DECalculatorInputs> = {},
): DECalculatorInputs {
  return {
    country: "DE",
    grossSalary,
    payFrequency: "annual",
    state: "BE",
    isMarried: false,
    isChurchMember: false,
    isChildless: false,
    contributions: {
      occupationalPension: 0,
      riesterContribution: 0,
      ruerupContribution: 0,
    },
    ...overrides,
    contributions: {
      occupationalPension: 0,
      riesterContribution: 0,
      ruerupContribution: 0,
      ...overrides.contributions,
    },
  };
}

describe("Germany calculator", () => {
  it("calculates 2026 income tax and employee social security at the default salary", () => {
    const result = DECalculator.calculate(inputs(55_000));
    const breakdown = result.breakdown as DEBreakdown;

    expect(result.taxableIncome).toBe(53_734);
    expect(result.taxes.incomeTax).toBe(11_883);
    expect(result.taxes.solidaritySurcharge).toBe(0);
    expect(result.taxes.pensionInsurance).toBe(5_115);
    expect(result.taxes.unemploymentInsurance).toBe(715);
    expect(result.taxes.healthInsurance).toBe(4_813);
    expect(result.taxes.longTermCareInsurance).toBe(990);
    expect(result.totalTax).toBe(23_516);
    expect(result.netSalary).toBe(31_484);
    expect(breakdown.standardDeductions.total).toBe(1_266);
  });

  it("caps bAV, Riester, and Ruerup while applying childless care and Bavarian church tax", () => {
    const limits = DECalculator.getContributionLimits(
      inputs(120_000, { isMarried: true }),
    );
    const result = DECalculator.calculate(
      inputs(120_000, {
        state: "BY",
        isMarried: true,
        isChurchMember: true,
        isChildless: true,
        contributions: {
          occupationalPension: 999_999,
          riesterContribution: 999_999,
          ruerupContribution: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as DEBreakdown;

    expect(limits.occupationalPension?.limit).toBe(8_112);
    expect(limits.riesterContribution?.limit).toBe(2_100);
    expect(limits.ruerupContribution?.limit).toBe(61_652);
    expect(breakdown.voluntaryContributions).toEqual({
      occupationalPension: 8_112,
      riester: 2_100,
      ruerup: 61_652,
      total: 71_864,
    });
    expect(result.taxableIncome).toBe(46_834);
    expect(result.taxes.incomeTax).toBe(9_453);
    expect(result.taxes.churchTax).toBe(756);
    expect(result.taxes.longTermCareInsurance).toBe(1_674);
    expect(result.netSalary).toBe(19_401);
    expect(breakdown.personalInfo.churchTaxRate).toBe(0.08);
  });

  it("clamps negative voluntary pension inputs to zero", () => {
    const defaultResult = DECalculator.calculate(inputs(55_000));
    const negativeResult = DECalculator.calculate(
      inputs(55_000, {
        contributions: {
          occupationalPension: -1_000,
          riesterContribution: -2_000,
          ruerupContribution: -3_000,
        },
      }),
    );
    const breakdown = negativeResult.breakdown as DEBreakdown;

    expect(breakdown.voluntaryContributions.total).toBe(0);
    expect(negativeResult.taxableIncome).toBe(defaultResult.taxableIncome);
    expect(negativeResult.netSalary).toBe(defaultResult.netSalary);
  });
});
