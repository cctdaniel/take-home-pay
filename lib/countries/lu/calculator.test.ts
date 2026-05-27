import { describe, expect, it } from "vitest";
import { LUCalculator } from "./calculator";
import type { LUBreakdown, LUCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<LUCalculatorInputs> = {},
): LUCalculatorInputs {
  return {
    country: "LU",
    grossSalary,
    payFrequency: "annual",
    taxClass: "class1",
    age: 35,
    numberOfChildren: 0,
    claimSingleParentCredit: false,
    childSupportOrAllowancesReceived: 0,
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

describe("Luxembourg calculator", () => {
  it("calculates class 1 resident salary tax with employment-fund surcharge and employee social insurance", () => {
    const result = LUCalculator.calculate(inputs(90_000));
    const breakdown = result.breakdown as LUBreakdown;

    expect(result.taxableIncome).toBe(78_585);
    expect(result.taxes.incomeTax).toBe(19_701);
    expect(result.taxes.socialContributions).toBe(11_541.44);
    expect(result.totalTax).toBe(31_242.44);
    expect(result.netSalary).toBe(58_757.56);
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Employment expense standard deduction",
          amount: 540,
        }),
        expect.objectContaining({
          name: "Special expenses standard deduction",
          amount: 480,
        }),
      ]),
    );
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Pension insurance employee contribution",
          amount: 7_650,
          rate: 0.085,
          cap: 162_224.16,
        }),
        expect.objectContaining({
          name: "Health insurance employee contribution",
          amount: 2_745,
          rate: 0.0305,
          cap: 162_224.16,
        }),
        expect.objectContaining({
          name: "Dependency insurance contribution",
          amount: 1_146.44,
          rate: 0.014,
        }),
      ]),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://impotsdirects.public.lu/content/acd/fr/baremes.html",
        "https://ccss.public.lu/en/assiettes-cotisation.html",
      ]),
    );
  });

  it("caps Article 111bis private pension savings and applies class 1a single-parent credits", () => {
    const result = LUCalculator.calculate(
      inputs(70_000, {
        taxClass: "class1a",
        age: 40,
        numberOfChildren: 2,
        claimSingleParentCredit: true,
        childSupportOrAllowancesReceived: 5_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as LUBreakdown;
    const limits = LUCalculator.getContributionLimits(inputs(70_000));

    expect(limits.retirementContribution?.limit).toBe(4_500);
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "retirementContribution",
        amount: 4_500,
        limit: 4_500,
      }),
    ]);
    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Employee tax credit", amount: 150 }),
        expect.objectContaining({ name: "Employee CO2 tax credit", amount: 54 }),
        expect.objectContaining({
          name: "Single-parent tax credit",
          amount: 2_360,
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(56_395);
    expect(result.taxes.incomeTax).toBe(5_393);
    expect(result.totalDeductions).toBe(18_844.44);
    expect(result.netSalary).toBe(51_155.56);
  });

  it("uses the capped social-security base and 9% employment-fund high-income adjustment", () => {
    const result = LUCalculator.calculate(
      inputs(360_000, {
        taxClass: "class2",
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as LUBreakdown;

    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: 13_789.05, rate: 0.085 }),
        expect.objectContaining({ amount: 4_947.84, rate: 0.0305 }),
        expect.objectContaining({ amount: 4_926.44, rate: 0.014 }),
      ]),
    );
    expect(breakdown.bracketTaxes).toEqual([
      expect.objectContaining({
        min: 234_900,
        max: 352_300,
        rate: 0.43600000000000005,
        tax: 115_286,
      }),
    ]);
    expect(result.taxableIncome).toBe(335_743.11);
    expect(result.taxes.socialContributions).toBe(23_663.33);
    expect(result.totalTax).toBe(138_949.33);
    expect(result.netSalary).toBe(216_550.67);
  });
});
