import { describe, expect, it } from "vitest";
import { NLCalculator } from "./calculator";
import type { NLBreakdown, NLCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<NLCalculatorInputs> = {},
): NLCalculatorInputs {
  return {
    country: "NL",
    grossSalary,
    payFrequency: "annual",
    hasThirtyPercentRuling: false,
    hasYoungChildren: false,
    thirtyPercentRulingType: "none",
    iackEligibility: "none",
    employeePensionPremiumAnnual: 0,
    pensionAccrualFactorA: 0,
    unusedAnnuityReserveMargin: 0,
    contributions: {
      lijfrenteContribution: 0,
    },
    ...overrides,
    contributions: {
      lijfrenteContribution: 0,
      ...overrides.contributions,
    },
  };
}

describe("Netherlands calculator", () => {
  it("splits 2026 box 1 tax between income tax and capped national insurance before credits", () => {
    const result = NLCalculator.calculate(inputs(55_000));
    const breakdown = result.breakdown as NLBreakdown;

    expect(result.taxableIncome).toBe(55_000);
    expect(breakdown.socialSecurity.total).toBeCloseTo(10_751.1495, 5);
    expect(breakdown.incomeTaxBreakdown.total).toBeCloseTo(9_203.0682, 5);
    expect(breakdown.taxCredits.generalTaxCredit).toBeCloseTo(1_498.60928, 5);
    expect(breakdown.taxCredits.laborTaxCredit).toBeCloseTo(5_072.5392, 5);
    expect(result.totalTax).toBeCloseTo(13_383.06922, 5);
    expect(result.netSalary).toBeCloseTo(41_616.93078, 5);
  });

  it("deducts employee pension premium and self-paid lijfrente within jaarruimte", () => {
    const limits = NLCalculator.getContributionLimits(inputs(100_000));
    const result = NLCalculator.calculate(
      inputs(100_000, {
        employeePensionPremiumAnnual: 5_000,
        contributions: {
          lijfrenteContribution: 10_000,
        },
      }),
    );
    const breakdown = result.breakdown as NLBreakdown;

    expect(limits.lijfrenteContribution?.limit).toBeCloseTo(24_248.4, 5);
    expect(breakdown.employeePensionPremiumAnnual).toBe(5_000);
    expect(breakdown.personalAnnuityContribution).toBe(10_000);
    expect(result.taxableIncome).toBe(85_000);
    expect(result.totalTax).toBeCloseTo(28_887.6141, 5);
    expect(result.totalDeductions).toBeCloseTo(43_887.6141, 5);
    expect(result.netSalary).toBeCloseTo(56_112.3859, 5);
  });

  it("applies the 30 percent ruling after the 2026 salary norm and cap rules", () => {
    const result = NLCalculator.calculate(
      inputs(120_000, {
        hasThirtyPercentRuling: true,
        thirtyPercentRulingType: "standard",
      }),
    );
    const breakdown = result.breakdown as NLBreakdown;

    expect(breakdown.thirtyPercentRulingApplied).toBe(true);
    expect(breakdown.thirtyPercentSalaryNorm).toBe(48_013);
    expect(breakdown.taxExemptAllowance).toBe(36_000);
    expect(result.taxableIncome).toBe(84_000);
    expect(result.totalTax).toBeCloseTo(28_327.5141, 5);
    expect(result.netSalary).toBeCloseTo(91_672.4859, 5);
  });
});
