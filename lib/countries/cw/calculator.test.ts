import { describe, expect, it } from "vitest";
import { CWCalculator } from "./calculator";
import type { CWBreakdown, CWCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CWCalculatorInputs> = {},
): CWCalculatorInputs {
  return {
    country: "CW",
    grossSalary,
    payFrequency: "annual",
    taxResidency: "resident",
    isMarriedSingleEarner: false,
    isAge60OrOlder: false,
    hasTransferredElderlyAllowance: false,
    childAllowanceCategoryI: 0,
    childAllowanceCategoryII: 0,
    childAllowanceCategoryIII: 0,
    childAllowanceCategoryIV: 0,
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

describe("Curacao calculator", () => {
  it("calculates resident wage tax with fixed employment deduction, basic credit, and social premiums", () => {
    const result = CWCalculator.calculate(inputs(90_000));
    const breakdown = result.breakdown as CWBreakdown;

    expect(result.taxableIncome).toBe(83_650);
    expect(result.taxes.incomeTax).toBe(9_973.9);
    expect(result.taxes.socialContributions).toBe(11_520);
    expect(result.totalTax).toBe(21_493.9);
    expect(result.netSalary).toBe(68_506.1);
    expect(breakdown.deductions).toEqual([
      { name: "Fixed employment expense deduction", amount: 500 },
    ]);
    expect(breakdown.taxCredits).toEqual([
      { name: "Basic tax credit", amount: 2_915 },
    ]);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "AOV/AWW old-age and widows/orphans premiums",
          amount: 5_850,
          rate: 0.065,
          cap: 100_000,
          preTax: true,
        }),
        expect.objectContaining({
          name: "BVZ basic health insurance premium",
          amount: 3_870,
          rate: 0.043,
        }),
        expect.objectContaining({
          name: "AVBZ long-term care premium",
          amount: 1_800,
          rate: 0.02,
        }),
      ]),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://belastingdienst.cw/wp-content/uploads/2026/01/Schijven-tarief-2026.pdf",
        "https://svbcur.org/premiepercentages-loongrenzen/",
      ]),
    );
  });

  it("applies resident single-earner, child-category, elderly, and provident-fund allowances", () => {
    const result = CWCalculator.calculate(
      inputs(90_000, {
        isMarriedSingleEarner: true,
        isAge60OrOlder: true,
        hasTransferredElderlyAllowance: true,
        childAllowanceCategoryI: 1,
        childAllowanceCategoryII: 2,
        childAllowanceCategoryIII: 3,
        childAllowanceCategoryIV: 4,
        contributions: {
          retirementContribution: 9_999,
        },
      }),
    );
    const breakdown = result.breakdown as CWBreakdown;

    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        { name: "Basic tax credit", amount: 2_915 },
        { name: "Single-earner allowance", amount: 1_779 },
        { name: "Child allowance", amount: 2_654 },
        { name: "Elderly allowance", amount: 1_342 },
        { name: "Transferred elderly allowance", amount: 673 },
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "retirementContribution",
        amount: 840,
        limit: 840,
      }),
    ]);
    expect(result.taxableIncome).toBe(82_810);
    expect(result.taxes.incomeTax).toBe(3_273.9);
    expect(result.totalDeductions).toBe(15_633.9);
    expect(result.netSalary).toBe(74_366.1);
  });

  it("removes resident credits and resident social premiums for foreign taxpayers", () => {
    const result = CWCalculator.calculate(
      inputs(90_000, {
        taxResidency: "foreign_taxpayer",
        isMarriedSingleEarner: true,
        isAge60OrOlder: true,
        contributions: {
          retirementContribution: 9_999,
        },
      }),
    );
    const breakdown = result.breakdown as CWBreakdown;

    expect(breakdown.mandatoryContributions).toEqual([]);
    expect(breakdown.taxCredits).toEqual([]);
    expect(breakdown.voluntaryContributions[0]).toEqual(
      expect.objectContaining({ amount: 840, limit: 840 }),
    );
    expect(result.taxableIncome).toBe(88_660);
    expect(result.taxes.incomeTax).toBe(14_391.9);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(74_768.1);
  });
});
