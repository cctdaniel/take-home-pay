import { describe, expect, it } from "vitest";
import { HUCalculator } from "./calculator";
import type { HUBreakdown, HUCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<HUCalculatorInputs> = {},
): HUCalculatorInputs {
  return {
    country: "HU",
    grossSalary,
    payFrequency: "annual",
    pitBaseAllowance: "none",
    claimPersonalAllowance: false,
    claimFirstMarriageAllowance: false,
    beneficiaryDependents: 0,
    totalDependents: 0,
    claimFamilyContributionAllowance: true,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Hungary calculator", () => {
  it("calculates flat 2026 PIT and employee social security for salary with no allowances", () => {
    const result = HUCalculator.calculate(inputs(24_000_000));
    const breakdown = result.breakdown as HUBreakdown;

    expect(result.taxableIncome).toBe(24_000_000);
    expect(result.taxes.incomeTax).toBe(3_600_000);
    expect(result.taxes.socialContributions).toBe(4_440_000);
    expect(result.totalTax).toBe(8_040_000);
    expect(result.netSalary).toBe(15_960_000);
    expect(breakdown.mandatoryContributions[0]).toEqual(
      expect.objectContaining({
        name: "Employee social security contribution",
        amount: 4_440_000,
        rate: 0.185,
        preTax: false,
      }),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2Ftaxinfo%2Fa-short-summary-on-the-taxation-of-private-persons",
        "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2Ftaxinfo%2Fsocial-security-contributions-payable",
      ]),
    );
  });

  it("applies NAV PIT-base allowances in order and caps voluntary pension fund credit", () => {
    const result = HUCalculator.calculate(
      inputs(12_000_000, {
        pitBaseAllowance: "under_25",
        claimPersonalAllowance: true,
        claimFirstMarriageAllowance: true,
        beneficiaryDependents: 3,
        totalDependents: 3,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as HUBreakdown;
    const limits = HUCalculator.getContributionLimits(inputs(12_000_000));

    expect(limits.retirementContribution?.limit).toBe(750_000);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Mother / under-25 PIT base allowance",
          amount: 8_589_180,
        }),
        expect.objectContaining({
          name: "Personal allowance",
          amount: 1_291_200,
        }),
        expect.objectContaining({
          name: "First-marriage allowance",
          amount: 400_020,
        }),
        expect.objectContaining({
          name: "Family tax allowance",
          amount: 15_840_000,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "retirementContribution",
        amount: 750_000,
        limit: 750_000,
        taxBenefit: 150_000,
      }),
    ]);
    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Family contribution allowance",
          amount: 2_118_060,
        }),
        expect.objectContaining({
          name: "Voluntary pension fund contribution credit",
          amount: 150_000,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(0);
    expect(result.totalTax).toBe(101_940);
    expect(result.totalDeductions).toBe(851_940);
    expect(result.netSalary).toBe(11_148_060);
  });
});
