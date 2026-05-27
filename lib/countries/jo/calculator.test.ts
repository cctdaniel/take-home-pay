import { describe, expect, it } from "vitest";
import { JOCalculator } from "./calculator";
import type { JOBreakdown, JOCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<JOCalculatorInputs> = {},
): JOCalculatorInputs {
  return {
    country: "JO",
    grossSalary,
    payFrequency: "annual",
    hasResidentDependents: false,
    sscMonthlyWage: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof JOCalculator.calculate>, key: string) {
  return (result.breakdown as JOBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("Jordan calculator", () => {
  it("applies the personal exemption, progressive PIT, and capped employee SSC wage", () => {
    const result = JOCalculator.calculate(inputs(48_000));
    const breakdown = result.breakdown as JOBreakdown;

    expect(breakdown.sscMonthlyWage).toBe(3_733);
    expect(breakdown.sscAnnualWage).toBe(44_796);
    expect(result.taxableIncome).toBe(39_000);
    expect(result.taxes.incomeTax).toBe(7_250);
    expect(result.taxes.socialContributions).toBe(3_359.7);
    expect(result.totalTax).toBe(10_609.7);
    expect(result.netSalary).toBe(37_390.3);
  });

  it("adds the resident-dependants exemption and higher qualifying expense cap", () => {
    const limits = JOCalculator.getContributionLimits(
      inputs(48_000, { hasResidentDependents: true }),
    );
    const result = JOCalculator.calculate(
      inputs(48_000, {
        hasResidentDependents: true,
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 4_000,
          housingExpenses: 0,
          charitableDonations: 0,
        },
      }),
    );

    expect(limits.qualifyingExpenses?.limit).toBe(3_000);
    expect(contributionAmount(result, "qualifyingExpenses")).toBe(3_000);
    expect(result.taxableIncome).toBe(27_000);
    expect(result.taxes.incomeTax).toBe(4_250);
    expect(result.totalTax).toBe(7_609.7);
    expect(result.netSalary).toBe(40_390.3);
  });

  it("uses an entered SSC monthly wage below the statutory cap when provided", () => {
    const result = JOCalculator.calculate(inputs(48_000, { sscMonthlyWage: 2_000 }));
    const breakdown = result.breakdown as JOBreakdown;

    expect(breakdown.sscMonthlyWage).toBe(2_000);
    expect(result.taxes.socialContributions).toBe(1_800);
    expect(result.totalTax).toBe(9_050);
    expect(result.netSalary).toBe(38_950);
  });

  it("applies government donation and approved charity limits in order", () => {
    const result = JOCalculator.calculate(
      inputs(48_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          housingExpenses: 10_000,
          charitableDonations: 10_000,
        },
      }),
    );

    expect(contributionAmount(result, "housingExpenses")).toBe(10_000);
    expect(contributionAmount(result, "charitableDonations")).toBe(7_250);
    expect(result.taxableIncome).toBe(21_750);
    expect(result.taxes.incomeTax).toBe(2_937.5);
    expect(result.totalTax).toBe(6_297.2);
    expect(result.netSalary).toBe(41_702.8);
  });

  it("adds the national contribution tax above the high-income threshold", () => {
    const result = JOCalculator.calculate(inputs(250_000));

    expect(result.taxableIncome).toBe(241_000);
    expect(result.taxes.incomeTax).toBe(57_750);
    expect(result.taxes.socialContributions).toBe(3_769.7);
    expect(result.totalTax).toBe(61_519.7);
    expect(result.netSalary).toBe(188_480.3);
  });
});
