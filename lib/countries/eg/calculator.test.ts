import { describe, expect, it } from "vitest";
import { EGCalculator } from "./calculator";
import type { EGBreakdown, EGCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<EGCalculatorInputs> = {},
): EGCalculatorInputs {
  const defaults = EGCalculator.getDefaultInputs() as EGCalculatorInputs;

  return {
    ...defaults,
    grossSalary,
    payFrequency: "annual",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

describe("Egypt calculator", () => {
  it("exposes the modeled registered premium deduction limit", () => {
    const limits = EGCalculator.getContributionLimits(inputs(900_000));

    expect(limits.retirementContribution?.name).toBe(
      "Private pension or life/health insurance premiums",
    );
    expect(limits.retirementContribution?.limit).toBe(10_000);
    expect(limits.qualifyingExpenses?.limit ?? 0).toBe(0);
    expect(limits.charitableDonations?.limit ?? 0).toBe(0);
  });

  it("caps and applies registered pension or insurance premiums", () => {
    const base = EGCalculator.calculate(inputs(900_000));
    const withPremiums = EGCalculator.calculate(
      inputs(900_000, {
        contributions: {
          retirementContribution: 50_000,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = withPremiums.breakdown as EGBreakdown;
    const retirementContribution = breakdown.voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    );

    expect(withPremiums.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withPremiums.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(retirementContribution?.amount).toBe(10_000);
    expect(retirementContribution?.limit).toBe(10_000);
  });

  it("uses the 2026 NOSI social insurance salary ceiling by default", () => {
    const result = EGCalculator.calculate(inputs(900_000));
    const breakdown = result.breakdown as EGBreakdown;

    expect(breakdown.socialInsuranceCovered).toBe(true);
    expect(breakdown.socialInsuranceSalaryMonthly).toBe(16_700);
    expect(breakdown.socialInsuranceSalaryAnnual).toBe(200_400);
    expect(result.taxes.socialContributions).toBe(22_044);
  });

  it("lets the actual monthly social insurance salary be lower than cash salary but not below the NOSI floor", () => {
    const lowerBase = EGCalculator.calculate(
      inputs(900_000, {
        socialInsuranceSalaryMonthly: 10_000,
      }),
    );
    const belowFloor = EGCalculator.calculate(
      inputs(900_000, {
        socialInsuranceSalaryMonthly: 1_000,
      }),
    );

    expect((lowerBase.breakdown as EGBreakdown).socialInsuranceSalaryMonthly).toBe(
      10_000,
    );
    expect(lowerBase.taxes.socialContributions).toBe(13_200);
    expect((belowFloor.breakdown as EGBreakdown).socialInsuranceSalaryMonthly).toBe(
      2_700,
    );
    expect(belowFloor.taxes.socialContributions).toBe(3_564);
  });

  it("supports confirmed social-insurance exemption or non-coverage", () => {
    const result = EGCalculator.calculate(
      inputs(900_000, {
        socialInsuranceCovered: false,
        socialInsuranceSalaryMonthly: 16_700,
      }),
    );

    expect((result.breakdown as EGBreakdown).socialInsuranceCovered).toBe(false);
    expect((result.breakdown as EGBreakdown).socialInsuranceSalaryMonthly).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
  });

  it("taxes employment benefits without treating them as cash or NOSI contribution salary", () => {
    const base = EGCalculator.calculate(inputs(900_000));
    const withBenefits = EGCalculator.calculate(
      inputs(900_000, {
        taxableNonCashBenefits: 120_000,
      }),
    );
    const breakdown = withBenefits.breakdown as EGBreakdown;

    expect(withBenefits.grossSalary).toBe(900_000);
    expect(breakdown.taxableNonCashBenefits).toBe(120_000);
    expect(breakdown.taxableGrossIncome).toBe(1_020_000);
    expect(breakdown.socialInsuranceSalaryMonthly).toBe(16_700);
    expect(withBenefits.taxes.socialContributions).toBe(
      base.taxes.socialContributions,
    );
    expect(withBenefits.taxes.incomeTax).toBeGreaterThan(base.taxes.incomeTax);
    expect(withBenefits.netSalary).toBeLessThan(base.netSalary);
  });
});
