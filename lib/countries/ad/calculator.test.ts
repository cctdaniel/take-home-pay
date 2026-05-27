import { describe, expect, it } from "vitest";
import { ADCalculator } from "./calculator";
import type { ADBreakdown, ADCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<ADCalculatorInputs> = {},
): ADCalculatorInputs {
  return {
    country: "AD",
    grossSalary,
    payFrequency: "annual",
    hasNonWorkingSpouseOrPartner: false,
    isDisabledTaxpayer: false,
    numberOfFamilyDependents: 0,
    numberOfDisabledDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Andorra calculator", () => {
  it("calculates resident IRPF with CASS, the capped 3% work expense, and 2026 bands", () => {
    const result = ADCalculator.calculate(inputs(50_000));
    const breakdown = result.breakdown as ADBreakdown;

    expect(breakdown.personalAllowance).toBe(24_000);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Employment expense deduction",
          amount: 1_500,
        }),
      ]),
    );
    expect(breakdown.mandatoryContributions[0]).toEqual(
      expect.objectContaining({
        name: "CASS employee contribution",
        amount: 3_250,
        rate: 0.065,
        preTax: true,
      }),
    );
    expect(result.taxableIncome).toBe(21_250);
    expect(result.taxes.incomeTax).toBe(1_325);
    expect(result.totalTax).toBe(4_575);
    expect(result.netSalary).toBe(45_425);
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.govern.ad/ca/l/4191468",
        "https://www.cass.ad/empreses1",
      ]),
    );
  });

  it("caps pension, mortgage, and family reductions from official Andorra limits", () => {
    const result = ADCalculator.calculate(
      inputs(200_000, {
        hasNonWorkingSpouseOrPartner: true,
        numberOfFamilyDependents: 3,
        numberOfDisabledDependents: 2,
        contributions: {
          retirementContribution: 999_999,
          housingExpenses: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as ADBreakdown;
    const limits = ADCalculator.getContributionLimits(inputs(10_000));

    expect(limits.retirementContribution?.limit).toBe(2_715);
    expect(limits.housingExpenses?.limit).toBe(4_000);
    expect(breakdown.personalAllowance).toBe(40_000);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Employment expense deduction",
          amount: 2_500,
        }),
        expect.objectContaining({
          name: "Family dependent reduction",
          amount: 3_000,
        }),
        expect.objectContaining({
          name: "Principal residence mortgage reduction",
          amount: 1_000,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 5_000,
          limit: 5_000,
        }),
        expect.objectContaining({
          key: "housingExpenses",
          amount: 4_000,
          limit: 4_000,
          cashFlowTreatment: "taxOnly",
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(135_500);
    expect(result.taxes.incomeTax).toBe(12_750);
    expect(result.netSalary).toBe(169_250);
  });
});
