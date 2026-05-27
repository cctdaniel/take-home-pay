import { describe, expect, it } from "vitest";
import { LVCalculator } from "./calculator";
import type { LVBreakdown, LVCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<LVCalculatorInputs> = {},
): LVCalculatorInputs {
  return {
    country: "LV",
    grossSalary,
    payFrequency: "annual",
    numberOfDependents: 0,
    isPensioner: false,
    pensionerAllowanceUsedElsewhere: 0,
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

describe("Latvia calculator", () => {
  it("calculates 2026 salary PIT with fixed non-taxable minimum and employee social insurance", () => {
    const result = LVCalculator.calculate(inputs(60_000));
    const breakdown = result.breakdown as LVBreakdown;

    expect(breakdown.personalAllowance).toBe(6_600);
    expect(breakdown.mandatoryContributions[0]).toEqual(
      expect.objectContaining({
        name: "Employee social insurance",
        amount: 6_300,
        rate: 0.105,
        cap: 105_300,
        preTax: true,
      }),
    );
    expect(result.taxableIncome).toBe(47_100);
    expect(result.taxes.incomeTax).toBe(12_010.5);
    expect(result.totalTax).toBe(18_310.5);
    expect(result.netSalary).toBe(41_689.5);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.vid.gov.lv/en/personal-income-tax",
        "https://www.fm.gov.lv/en/non-taxable-minimum-and-tax-allowances",
      ]),
    );
  });

  it("caps pension, life-insurance, and eligible-expense deductions while applying pensioner and dependent allowances", () => {
    const result = LVCalculator.calculate(
      inputs(200_000, {
        numberOfDependents: 3,
        isPensioner: true,
        pensionerAllowanceUsedElsewhere: 2_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as LVBreakdown;
    const limits = LVCalculator.getContributionLimits(inputs(30_000));

    expect(limits.retirementContribution?.limit).toBe(3_000);
    expect(limits.qualifyingExpenses?.limit).toBe(600);
    expect(breakdown.personalAllowance).toBe(10_000);
    expect(breakdown.deductions).toEqual([
      expect.objectContaining({
        name: "Dependent allowance",
        amount: 9_000,
      }),
    ]);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 4_000,
          limit: 4_000,
        }),
        expect.objectContaining({
          key: "qualifyingExpenses",
          amount: 600,
          limit: 600,
          cashFlowTreatment: "taxOnly",
        }),
      ]),
    );
    expect(breakdown.bracketTaxes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ min: 0, max: 105_300, rate: 0.255 }),
        expect.objectContaining({ min: 105_300, rate: 0.33 }),
      ]),
    );
    expect(result.taxableIncome).toBe(165_343.5);
    expect(result.taxes.incomeTax).toBe(46_665.86);
    expect(result.taxes.socialContributions).toBe(11_056.5);
    expect(result.totalDeductions).toBe(61_722.36);
    expect(result.netSalary).toBe(138_277.64);
  });
});
