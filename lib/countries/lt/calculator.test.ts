import { describe, expect, it } from "vitest";
import { LTCalculator } from "./calculator";
import type { LTBreakdown, LTCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<LTCalculatorInputs> = {},
): LTCalculatorInputs {
  return {
    country: "LT",
    grossSalary,
    payFrequency: "annual",
    secondPillarRate: "0",
    disabilityNpdType: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      educationExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      educationExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function contributionAmount(result: ReturnType<typeof LTCalculator.calculate>, key: string) {
  return (result.breakdown as LTBreakdown).voluntaryContributions.find(
    (contribution) => contribution.key === key,
  )?.amount;
}

describe("Lithuania calculator", () => {
  it("phases out ordinary NPD and applies 2026 employment PIT and social insurance rates", () => {
    const result = LTCalculator.calculate(inputs(60_000));

    expect(result.taxableIncome).toBe(60_000);
    expect(result.taxes.incomeTax).toBe(12_000);
    expect(result.taxes.socialContributions).toBe(11_700);
    expect(result.totalTax).toBe(23_700);
    expect(result.netSalary).toBe(36_300);
  });

  it("adds selected second-pillar pension accumulation as a separate employee contribution", () => {
    const result = LTCalculator.calculate(
      inputs(60_000, { secondPillarRate: "3" }),
    );

    expect(result.taxes.socialContributions).toBe(13_500);
    expect(result.totalTax).toBe(25_500);
    expect(result.netSalary).toBe(34_500);
  });

  it("replaces ordinary NPD with the selected disability NPD", () => {
    const result = LTCalculator.calculate(
      inputs(60_000, { disabilityNpdType: "participation_0_25" }),
    );
    const breakdown = result.breakdown as LTBreakdown;

    expect(breakdown.deductions[0].amount).toBe(13_524);
    expect(result.taxableIncome).toBe(46_476);
    expect(result.taxes.incomeTax).toBe(9_295.2);
    expect(result.totalTax).toBe(20_995.2);
    expect(result.netSalary).toBe(39_004.8);
  });

  it("applies the Article 21 pension-life shared cap before the remaining education cap", () => {
    const limits = LTCalculator.getContributionLimits(inputs(60_000));
    const result = LTCalculator.calculate(
      inputs(60_000, {
        contributions: {
          retirementContribution: 1_500,
          qualifyingExpenses: 0,
          insurancePremiums: 1_500,
          educationExpenses: 20_000,
        },
      }),
    );

    expect(limits.retirementContribution?.limit).toBe(1_500);
    expect(contributionAmount(result, "retirementContribution")).toBe(1_500);
    expect(contributionAmount(result, "insurancePremiums")).toBe(0);
    expect(contributionAmount(result, "educationExpenses")).toBe(13_500);
    expect(result.taxableIncome).toBe(45_000);
    expect(result.taxes.incomeTax).toBe(9_000);
    expect(result.totalTax).toBe(20_700);
    expect(result.totalDeductions).toBe(22_200);
    expect(result.netSalary).toBe(37_800);
  });

  it("keeps the full ordinary NPD below the phaseout threshold", () => {
    const result = LTCalculator.calculate(inputs(12_000));
    const breakdown = result.breakdown as LTBreakdown;

    expect(breakdown.deductions[0].amount).toBe(8_964);
    expect(result.taxableIncome).toBe(3_036);
    expect(result.taxes.incomeTax).toBe(607.2);
    expect(result.taxes.socialContributions).toBe(2_340);
    expect(result.totalTax).toBe(2_947.2);
    expect(result.netSalary).toBe(9_052.8);
  });
});
