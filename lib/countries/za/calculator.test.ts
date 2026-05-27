import { describe, expect, it } from "vitest";
import { ZACalculator } from "./calculator";
import type { ZABreakdown, ZACalculatorInputs, ZATaxBreakdown } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ZACalculatorInputs> = {},
): ZACalculatorInputs {
  return {
    country: "ZA",
    grossSalary,
    payFrequency: "annual",
    taxableNonCashBenefits: 0,
    ageBand: "under65",
    medicalSchemeMembers: 0,
    hasDisabilityInFamily: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
  };
}

describe("South Africa calculator", () => {
  it("calculates 2026/27 PAYE, primary rebate, and capped UIF for ordinary salary", () => {
    const result = ZACalculator.calculate(inputs(900_000));
    const breakdown = result.breakdown as ZABreakdown;
    const taxes = result.taxes as ZATaxBreakdown;

    expect(result.taxableIncome).toBe(900_000);
    expect(taxes.incomeTax).toBe(247_293);
    expect(taxes.socialContributions).toBe(2_125.44);
    expect(result.totalTax).toBe(249_418.44);
    expect(result.netSalary).toBe(650_581.56);
    expect(breakdown.taxCredits).toEqual([
      { name: "Primary rebate", amount: 17_820 },
    ]);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          limit: 247_500,
        }),
        expect.objectContaining({
          key: "charitableDonations",
          limit: 90_000,
        }),
      ]),
    );
  });

  it("aligns taxable-fringe-benefit contribution limits with calculator clamping and medical credits", () => {
    const richInputs = inputs(1_200_000, {
      taxableNonCashBenefits: 100_000,
      ageBand: "age75plus",
      medicalSchemeMembers: 3,
      hasDisabilityInFamily: true,
      contributions: {
        retirementContribution: 999_999,
        medicalExpenses: 120_000,
        insurancePremiums: 240_000,
        charitableDonations: 999_999,
      },
    });
    const limits = ZACalculator.getContributionLimits(richInputs);
    const result = ZACalculator.calculate(richInputs);
    const breakdown = result.breakdown as ZABreakdown;

    expect(limits.retirementContribution?.limit).toBe(357_500);
    expect(limits.charitableDonations?.limit).toBe(94_250);
    expect(breakdown.taxableNonCashBenefits).toBe(100_000);
    expect(breakdown.taxableGrossIncome).toBe(1_300_000);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 357_500,
          limit: 357_500,
        }),
        expect.objectContaining({
          key: "charitableDonations",
          amount: 94_250,
          limit: 94_250,
        }),
      ]),
    );
    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        { name: "Age rebate", amount: 13_014 },
        { name: "Medical scheme fees tax credit", amount: 12_072 },
        { name: "Additional medical expenses tax credit", amount: 107_928 },
      ]),
    );
    expect(result.taxableIncome).toBe(848_250);
    expect(result.totalTax).toBe(95_961.94);
    expect(result.totalDeductions).toBe(453_461.94);
    expect(result.netSalary).toBe(746_538.06);
  });
});
